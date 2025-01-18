/*
  * Copyright 2012-2021 the original author or authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *      http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
var data = {};

function run() {
	var projectPage = 1;
	var pageSize = 20;
	var sonarUrl = CATEGORY_SONAR_URL.replace(/\/+$/, "");
    var sonarToken = CATEGORY_SONAR_TOKEN;
    var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

	var locMetrics = [];
	data.datasets = [];
	data.projectNames = '';

	data.fromDate = computeStartDate();
	var projectNames = WIDGET_PROJECT_KEY.split(",");
	var labels = [];
	var locPerDateArr = [];
	var locData = [];
    var datasets = [];

	projectNames.forEach(function(projectKey, index) {

	    locMetrics = [];
	    locPerDateArr = [];
        data.projectNames += projectKey.split(":")[1] + ", ";
		projectPage = 1;

		var response = getLinesOfCodeFromSonarQube(sonarUrl,sonarToken,projectKey,pageSize,projectPage,data.fromDate);
		if (response && response.measures[0] && response.measures[0].history && response.measures[0].history.length > 0) {
		    locMetrics = locMetrics.concat(response.measures[0].history);
	     }
		while (response.paging.total >
                     response.paging.pageIndex * response.paging.pageSize) {
			projectPage++;
			var response = getLinesOfCodeFromSonarQube(sonarUrl,sonarToken,projectKey,pageSize,projectPage,data.fromDate);
			locMetrics = locMetrics.concat(response.measures[0].history);
		}

		locMetrics.forEach(function (locHistory) {
            dateExtract = new Date(locHistory.date);
            dateFirstTen =
              dateExtract.getFullYear() +
              "-" +
              ("0" + (dateExtract.getMonth() + 1)).slice(-2) +
              "-" +
              ("0" + dateExtract.getUTCDate()).slice(-2);

            if (WIDGET_PERIOD_UNIT == "Day") {
              displayDate = dateFirstTen;
            } else if (WIDGET_PERIOD_UNIT == "Week") {
              displayDate = dateFirstTen;
            } else if (WIDGET_PERIOD_UNIT == "Month") {
              displayDate =
                monthNames[dateExtract.getMonth()] + "," + dateExtract.getFullYear();
            } else if (WIDGET_PERIOD_UNIT == "Year") {
              displayDate = dateExtract.getFullYear().toString();
            }

            if (labels.indexOf(displayDate) == -1) {
                labels.push(displayDate.toString());
            }
            locPerDateArr.push(displayDate+":"+locHistory.value);
        });

        labels.sort(orderMetricsByDate);

        locData = [];
        labels.forEach(function(displayDate) {
          for (var i = locPerDateArr.length - 1; i >= 0; i--) {
            var locPerDate = locPerDateArr[i];
            var entryDate = locPerDate.split(":")[0];

            if(entryDate === displayDate) {
              locData.push({

                  x: displayDate,
                  y: locPerDate.split(":")[1]
              });
              break;
            }
          }

        });

        datasets.push(JSON.stringify({
            label : projectKey.split(":")[1] != null ? projectKey.split(":")[1] : projectKey.split(":")[0],
            data : locData,
            backgroundColor: getColorForTrigram(index, '0.2'),
            borderColor: getColorForTrigram(index, '0.6'),
            pointBackgroundColor: getColorForTrigram(index, '1'),
            pointBorderColor: getColorForTrigram(index, '0.6'),
            pointBorderWidth: 5

        })
        );
    });
    data.labels = JSON.stringify(labels);
    data.datasets = JSON.stringify(datasets.every(zeroTest) ? [] : datasets);
    return JSON.stringify(data);
}

function zeroTest(element) {
    return element === 0;
}

/**
 * Compute the start date of the loc metrics from the widget parameters
 * @returns {string}
 */
function computeStartDate() {
    var computedDate = new Date();
	if (WIDGET_PERIOD_UNIT) {
		var numberOfPeriods = 1;
		if (WIDGET_PERIOD_NUMBER) {
			numberOfPeriods = WIDGET_PERIOD_NUMBER;
		}

		 if (WIDGET_PERIOD_UNIT === "Day") {
              computedDate.setDate(new Date().getDate() - numberOfPeriods);
         } else if (WIDGET_PERIOD_UNIT === "Week") {
			computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
		} else if (WIDGET_PERIOD_UNIT === "Month") {
			computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
		} else if (WIDGET_PERIOD_UNIT === "Year") {
			computedDate.setFullYear(new Date().getFullYear() - numberOfPeriods);
		}

		computedDate.setUTCHours(0, 0, 0, 0);
	}
	return formatDate(computedDate);
}

/**
 * Format the date to keep yyyy-MM-dd
 */
function formatDate(date) {
	return new Date(date).getFullYear()
		+ "-"
		+ ("0" + (new Date(date).getMonth() + 1)).slice(-2)
		+ "-"
		+ ("0" + new Date(date).getUTCDate()).slice(-2);
}

function getLinesOfCodeFromSonarQube(
  sonarUrl,
  sonarToken,
  projectKeys,
  pageSize,
  projectPage,
  fromDate
) {
  var sonarApiUrl =
    sonarUrl +
    "/api/measures/search_history?" +
    (WIDGET_BRANCH != null ? "branch=" + WIDGET_BRANCH + "&" : (WIDGET_PULL_REQUEST != null ? "pullRequest=" + WIDGET_PULL_REQUEST + "&" : "")) +
    "metrics=ncloc&component=" +
    projectKeys +
    "&ps=" +
    pageSize +
    "&p=" +
    projectPage;

  if (fromDate) {
    sonarApiUrl = sonarApiUrl + "&from=" + fromDate;
  }

  return JSON.parse(
    Packages.get(
      sonarApiUrl,
      "Authorization",
      "Basic " + Packages.btoa(sonarToken + ":")
    )
  );
}


/**
 * Keep unique value in array
 *
 * @param value The value
 * @param index The index
 * @param self The array
 * @returns {boolean}
 */
function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

/**
 * Generate RGBA color for data
 *
 * @param index The index of the entity to color
 * @param opacity The opacity
 * @returns {string}
 */
function getColorForTrigram(index, opacity) {
	return 'rgba(' + ((255 - index * 12) % 256) + ',' + ((102 + index * 12) % 256) + ',' + ((255 + index * 12) % 256) + ',' + opacity + ')';
}

function orderMetricsByDate(firstCommit, secondCommit) {
	if (new Date(firstCommit) < new Date(secondCommit)){
		return -1;
	}

	if (new Date(firstCommit) > new Date(secondCommit)){
		return 1;
	}
	return 0;
}



