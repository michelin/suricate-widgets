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
	var page = 1;
	var perPage = 100;
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

	var commits = [];
	var oldestCommitDate = new Date();
	data.datasets = [];
	data.projectNames = '';

	data.fromDate = computeStartDate();
	var projectIDs = SURI_PROJECT.replaceAll("/", "%2F").split(",");
	var labels = [];

	projectIDs.forEach(function(id, index) {
		commits = [];
		page = 1;

		var dataCommits = [];

		var project = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
		data.projectNames += project.name + ", ";

		var response = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id + "/repository/commits?per_page=" + perPage + "&page=" + page + "&since=" + data.fromDate, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		commits = commits.concat(response);

		while (response && response.length > 0 && response.length === perPage) {
			page++;
			response = JSON.parse(
				Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id + "/repository/commits?per_page=" + perPage + "&page=" + page + "&since=" + data.fromDate, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
			commits = commits.concat(response);
		}

		if (commits.length > 0) {
		    commits.sort(orderCommitsByDate);
			if (new Date(oldestCommitDate) > new Date(commits[0].created_at)) {
				oldestCommitDate = formatDate(commits[0].created_at);
			}

			commits.forEach(function (commit) {
                dateExtract = new Date(commit.created_at);
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
                dataCommits.push(displayDate);
            });

        }

        labels.sort(orderCommitsByDate);

        data.datasets.push(JSON.stringify({
            label: project.name,
            data: labels.map(function (displayDate) {
                var commitsSameDate = dataCommits.filter(function (dataCommit) {
                    if (dataCommit === displayDate) {
                        return dataCommit;
                    }
                });

                return {
                    x: displayDate,
                    y: commitsSameDate.length
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
		data.fromDate = oldestCommitDate;
	}
    data.labels = JSON.stringify(labels);
	data.projectNames = data.projectNames.slice(0, -2);
    data.datasets = JSON.stringify(data.datasets);

	return JSON.stringify(data);
}

/**
 * Compute the start date of the releases from the widget parameters
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
 * Order the commits by date
 *
 * @param firstCommit The first commit created Date
 * @param secondCommit The second commit created Date
 * @returns {number}*
 */
function orderCommitsByDate(firstCommit, secondCommit) {
	if (new Date(firstCommit) < new Date(secondCommit)){
		return -1;
	}

	if (new Date(firstCommit) > new Date(secondCommit)){
		return 1;
	}
	return 0;
}
