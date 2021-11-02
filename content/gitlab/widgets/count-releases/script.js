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

function run() {
	var perPage = 100;
	var releases = [];
	var page = 1;

	var data = {};
	data.projects = '';
	data.numberOfReleases = 0;
	data.countAverageTimeReleases = 0;
	data.releasesDate = []; // Store all the dates of all releases
	data.timeBetweenReleases = []; // Store the time in days between two releases

	data.fromDate = computeStartDate();

	var projectIDs = SURI_PROJECT.split(",");

	projectIDs.forEach(function(id) {
		data.projects += JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN)).name + ", ";

		var response = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id + "/releases?per_page=" + perPage + "&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		releases = releases.concat(response);

		while (response && response.length > 0 && response.length === perPage) {
			page++;

			response = JSON.parse(
				Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id + "/releases?per_page=" + perPage + "&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

			releases = releases.concat(response);
		}
	});


	// Keep deployments performed after the given date
	if (data.fromDate) {
		releases = releases.filter(function(release) {
			if (release.released_at && new Date(release.released_at) >= new Date(data.fromDate)) {
				return release;
			}
		});
	}

	// Sum the number of days between 2 releases
	if (releases.length > 0 && SURI_DISPLAY_AVERAGE_TIME_RELEASES && SURI_DISPLAY_AVERAGE_TIME_RELEASES === 'true') {
		releases.sort(orderReleasesByDate);

		// Stored but not displayed, used for getting more information about the handled values
		data.releasesDate.push(releases[0].released_at);

		for (var i = 1; i < releases.length; i++) {
			data.releasesDate.push(releases[i].released_at);

			var timeBetweenReleases = Math.round(
				Math.abs(
					new Date(releases[i].released_at).getTime() - new Date(releases[i - 1].released_at).getTime()) / 3600000);

			// Stored but not displayed, used for getting more information about the handled values
			data.timeBetweenReleases.push(Math.round(timeBetweenReleases / 24));

			data.countAverageTimeReleases += timeBetweenReleases;
		}

		data.countAverageTimeReleases = Math.round((data.countAverageTimeReleases / (releases.length - 1)) / 24);
	}

	data.numberOfReleases += releases.length;
	data.projects = data.projects.slice(0, -2);

	return JSON.stringify(data);
}

/**
 * Compute the start date of the releases from the widget parameters
 * @returns {string}
 */
function computeStartDate() {
	if (SURI_DATE) {
		return SURI_DATE.slice(4) + "-" + SURI_DATE.slice(2, 4) + "-" + SURI_DATE.slice(0, 2);
	}

	if (SURI_PERIOD) {
		var numberOfPeriods = 1;
		if (SURI_NUMBER_OF_PERIOD) {
			numberOfPeriods = SURI_NUMBER_OF_PERIOD;
		}

		var computedDate = new Date();

		if (SURI_PERIOD === "Day") {
			computedDate.setDate(new Date().getDate() - numberOfPeriods);
		} else if (SURI_PERIOD === "Week") {
			computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
		} else if (SURI_PERIOD === "Month") {
			computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
		} else if (SURI_PERIOD === "Year") {
			computedDate.setFullYear(new Date().getFullYear() - numberOfPeriods);
		}

		computedDate.setUTCHours(0, 0, 0, 0);

		return formatDate(computedDate);
	}
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
 * Order the releases by date
 *
 * @param release1 The first release
 * @param release2 The second release
 * @returns {number}
 */
function orderReleasesByDate(release1, release2) {
	if (new Date(release1.released_at) < new Date(release2.released_at)){
		return -1;
	}

	if (new Date(release1.released_at) > new Date(release2.released_at)){
		return 1;
	}

	return 0;
}
