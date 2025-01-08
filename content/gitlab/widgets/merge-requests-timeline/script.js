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

	var mergeRequests = [];
	var oldestMergeRequestDate = new Date();
	data.datasets = [];
	data.projectOrGroupNames = '';
	var labels = [];

	data.fromDate = computeStartDate();
	var projectOrGroupType = computeIDType();

	var projectOrGroupIDs = WIDGET_PROJECT_IDS_OR_PATHS.replaceAll("/", "%2F").split(",");
	data.mrsState = WIDGET_MERGE_REQUESTS_STATE;

	projectOrGroupIDs.forEach(function(id, index) {
	    mergeRequests = [];
	    page = 1;
	    var dataMergeRequests = [];

		var projectOrGroup = JSON.parse(
			Packages.get(CATEGORY_GITLAB_URL + "/api/v4/" + projectOrGroupType + "/" + id, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

		data.projectOrGroupNames += projectOrGroup.name + ", ";

		var response = JSON.parse(
			Packages.get(CATEGORY_GITLAB_URL + "/api/v4/" + projectOrGroupType + "/" + id + "/merge_requests?per_page=" + perPage + "&page=" + page + "&created_after=" + data.fromDate + "&state=" + WIDGET_MERGE_REQUESTS_STATE + "&sort=asc", "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

		mergeRequests = mergeRequests.concat(response);

		while (response && response.length > 0 && response.length === perPage) {
			page++;

			response = JSON.parse(
				Packages.get(CATEGORY_GITLAB_URL + "/api/v4/" + projectOrGroupType + "/" + id + "/merge_requests?per_page=" + perPage + "&page=" + page + "&created_after=" + data.fromDate + "&state=" + WIDGET_MERGE_REQUESTS_STATE + "&sort=asc", "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

			mergeRequests = mergeRequests.concat(response);
		}


		if (mergeRequests.length > 0) {
			if (new Date(oldestMergeRequestDate) > new Date(mergeRequests[0].created_at)) {
				oldestMergeRequestDate = formatDate(mergeRequests[0].created_at);
			}

			mergeRequests.forEach(function (mergeRequest) {
                dateExtract = new Date(mergeRequest.created_at);
                dateFirstTen =
                  dateExtract.getFullYear() +
                  "-" +
                  ("0" + (dateExtract.getMonth() + 1)).slice(-2) +
                  "-" +
                  ("0" + dateExtract.getUTCDate()).slice(-2);

                if (WIDGET_PERIOD_UNIT == "week") {
                  displayDate = dateFirstTen;
                } else if (WIDGET_PERIOD_UNIT == "month") {
                  displayDate =
                    monthNames[dateExtract.getMonth()] + "," + dateExtract.getFullYear();
                } else if (WIDGET_PERIOD_UNIT == "year") {
                  displayDate = dateExtract.getFullYear();
                }

                if (labels.indexOf(displayDate) == -1) {
                    labels.push(displayDate);
                }
                dataMergeRequests.push(displayDate);
            });
		}

		labels.sort(orderMergeRequestsByDate);

		data.datasets.push(JSON.stringify({
            label: projectOrGroup.name,
            data: labels.map(function (displayDate) {
                var mRsSameDate = dataMergeRequests.filter(function (dataMR) {
                    if (dataMR === displayDate) {
                        return dataMR;
                    }
                });

                return {
                    x: displayDate,
                    y: mRsSameDate.length
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
		data.fromDate = oldestMergeRequestDate;
	}
    data.labels = JSON.stringify(labels);
	data.projectOrGroupNames = data.projectOrGroupNames.slice(0, -2);
	data.datasets = JSON.stringify(data.datasets);

	return JSON.stringify(data);
}

/**
* Compute the ID type passed from the widget parameters
* @return {string}
*/
function computeIDType(){
    if (WIDGET_GROUP_OR_PROJECT === "group") {
        return "groups";
    }else{
        return "projects";
    }
}

/**
 * Compute the start date of the merge requests from the widget parameters
 * @returns {string}
 */
function computeStartDate() {
	var computedDate = new Date();
    if (WIDGET_PERIOD_UNIT) {
        var numberOfPeriods = 1;
        if (WIDGET_PERIOD_NUMBER) {
            numberOfPeriods = WIDGET_PERIOD_NUMBER;
        }

        if (WIDGET_PERIOD_UNIT === "week") {
            computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
        } else if (WIDGET_PERIOD_UNIT === "month") {
            computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
        } else if (WIDGET_PERIOD_UNIT === "year") {
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
 * Order the merge requests by date
 *
 * @param firstMergeRequest The first merge request date
 * @param secondMergeRequest The second merge request date
 * @returns {number}
 */
function orderMergeRequestsByDate(firstMergeRequest, secondMergeRequest) {
	if (new Date(firstMergeRequest) < new Date(secondMergeRequest)){
		return -1;
	}

	if (new Date(firstMergeRequest) > new Date(secondMergeRequest)){
		return 1;
	}
	return 0;
}
