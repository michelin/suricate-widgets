/*
  * Copyright 2012-2021 the original author or authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *      /http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */
var data = {};

function run() {
	var page = 1;
	var perPage = 10;
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
	var issues = [];
	var oldestIssueDate = new Date();
	data.datasets = [];
	data.projectOrGroupNames = '';

	data.fromDate = computeStartDate();
	var projectOrGroupType = computeIDType();

	var projectOrGroupIDs = SURI_ID.split(",").replaceAll("/", "%2F");
	data.issueState = SURI_ISSUES_STATE;
	var labels = [];

	projectOrGroupIDs.forEach(function(id, index) {
	    issues = [];
	    page = 1;

	    var dataIssues = [];

		var projectOrGroup = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/" + projectOrGroupType + "/" + id, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		data.projectOrGroupNames += projectOrGroup.name + ", ";

		var response = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/" + projectOrGroupType + "/" + id + "/issues?per_page=" + perPage + "&page=" + page + "&created_after=" + data.fromDate + "&state=" + SURI_ISSUES_STATE + "&sort=asc", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		issues = issues.concat(response);

		while (response && response.length > 0 && response.length === perPage) {
			page++;

			response = JSON.parse(
				Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/" + projectOrGroupType + "/" + id + "/issues?per_page=" + perPage + "&page=" + page + "&created_after=" + data.fromDate + "&state=" + SURI_ISSUES_STATE + "&sort=asc", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

			issues = issues.concat(response);
		}

		if (issues.length > 0) {
			if (new Date(oldestIssueDate) > new Date(issues[0].created_at)) {
				oldestIssueDate = formatDate(issues[0].created_at);
			}

			issues.forEach(function (issue) {
                dateExtract = new Date(issue.created_at);
                dateFirstTen =
                  dateExtract.getFullYear() +
                  "-" +
                  ("0" + (dateExtract.getMonth() + 1)).slice(-2) +
                  "-" +
                  ("0" + dateExtract.getUTCDate()).slice(-2);

                if (SURI_PERIOD == "Week") {
                  displayDate = dateFirstTen;
                } else if (SURI_PERIOD == "Month") {
                  displayDate =
                    monthNames[dateExtract.getMonth()] + "," + dateExtract.getFullYear();
                } else if (SURI_PERIOD == "Year") {
                  displayDate = dateExtract.getFullYear();
                }

                if (labels.indexOf(displayDate) == -1) {
                    labels.push(displayDate);
                }
                dataIssues.push(displayDate);
            });
		}

		labels.sort(orderIssuesByDate);

	    data.datasets.push(JSON.stringify({
            label: projectOrGroup.name,
            data: labels.map(function (displayDate) {
                var issuesSameDate = dataIssues.filter(function (dataIssue) {
                    if (dataIssue === displayDate) {
                        return dataIssue;
                    }
                });

                return {
                    x: displayDate,
                    y: issuesSameDate.length
                };
            }),
            backgroundColor: getColorForTrigram(index, '0.2'),
            borderColor: getColorForTrigram(index, '0.6'),
            pointBackgroundColor: getColorForTrigram(index, '1'),
            pointBorderColor: getColorForTrigram(index, '0.6'),
            pointBorderWidth: 5
        }));
	});
	if (!data.fromDate) {
		data.fromDate = oldestIssueDate;
	}
	data.projectOrGroupNames = data.projectOrGroupNames.slice(0, -2);
	data.labels = JSON.stringify(labels);
    data.datasets = JSON.stringify(data.datasets);

    return JSON.stringify(data);
}

/**
* Compute the ID type passed from the widget parameters
* @return {string}
*/
function computeIDType(){
    if (SURI_ID_TYPE === "Group ID") {
        return "groups";
    }else{
        return "projects";
    }
}

/**
 * Compute the start date of the issues from the widget parameters
 * @returns {string}
 */
function computeStartDate() {
	var computedDate = new Date();
    if (SURI_PERIOD) {
        var numberOfPeriods = 1;
        if (SURI_NUMBER_OF_PERIOD) {
            numberOfPeriods = SURI_NUMBER_OF_PERIOD;
        }

        if (SURI_PERIOD === "Week") {
            computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
        } else if (SURI_PERIOD === "Month") {
            computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
        } else if (SURI_PERIOD === "Year") {
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

/**
 * Order the issues by date
 *
 * @param firstIssue The first issue create date
 * @param secondIssue The second issue create date
 * @returns {number}
 */
function orderIssuesByDate(firstIssue, secondIssue) {
	if (new Date(firstIssue) < new Date(secondIssue)){
		return -1;
	}

	if (new Date(firstIssue) > new Date(secondIssue)){
		return 1;
	}

	return 0;
}
