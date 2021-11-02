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
	var perPage = 100;
	var releases = [];
	var page = 1;

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

	// Keep releases performed after the given date
	if (data.fromDate) {
		releases = releases.filter(function(release) {
			if (release.released_at && new Date(release.released_at) >= new Date(data.fromDate)) {
				return release;
			}
		});
	}

	if (releases.length > 0) {
		releases.sort(orderReleasesByDate);

		if (SURI_AGGREGATE_BY && SURI_AGGREGATE_BY.split(",").length > 0) {
			var aggregations = SURI_AGGREGATE_BY.split(",");

			if (aggregations.length === 1) {
				// Aggregate releases by date for the counting
				if (aggregations.indexOf('AGGREGATE_BY_DATE') > -1) {
					releases = filterUniqueByDate(releases);
				} else {
					// Aggregate releases by tag name for the counting
					if (aggregations.indexOf('AGGREGATE_BY_TAG_NAME') > -1) {
						releases = filterUniqueByTagName(releases);
					}
				}
			} else {
				if (aggregations.length === 2 && aggregations.indexOf('AGGREGATE_BY_DATE') > -1 && aggregations.indexOf('AGGREGATE_BY_TAG_NAME') > -1) {
					releases = filterUniqueCoupleOfDateAndTagName(releases);
				}
			}
		}

		// Sum the number of days between 2 releases
		if (SURI_DISPLAY_AVERAGE_TIME_RELEASES && SURI_DISPLAY_AVERAGE_TIME_RELEASES === 'true') {
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

/**
 * Filter releases to keep releases with unique date called to computed the case: multiple releases with same date = 1 release
 *
 * @param releases The releases to filter
 * @returns {*[]}
 */
function filterUniqueByDate(releases) {
	var filteredReleases = [];

	// Used for debug only
	data.dataBeforeAggregation = JSON.stringify(releases.map(function(release) {
		return release.released_at;
	}));

	releases.forEach(function(release) {
		var containDate = filteredReleases.filter(function(filteredRelease) {
			if (formatDate(release.released_at) === formatDate(filteredRelease.released_at)) {
				return filteredRelease;
			}
		}).length > 0;

		if (!containDate) {
			filteredReleases.push(release);
		}
	});

	// Used for debug only
	data.dataAfterAggregation = JSON.stringify(filteredReleases.map(function(filteredRelease) {
		return filteredRelease.released_at;
	}));

	return filteredReleases;
}

/**
 * Filter releases to keep releases with unique tag name, called to computed the case: multiple releases with same tag name = 1 release
 *
 * @param releases The releases to filter
 * @returns {*[]}
 */
function filterUniqueByTagName(releases) {
	var filteredReleases = [];

	// Used for debug only
	data.dataBeforeAggregation = JSON.stringify(releases.map(function(release) {
		return release.tag_name;
	}));

	releases.forEach(function(release) {
		var containTagName = filteredReleases.filter(function(filteredRelease) {
			// Handle the case version 1.0.0 is considered equal to v1.0.0
			if (release.tag_name.toLowerCase() === filteredRelease.tag_name.toLowerCase()
				|| 'v' + release.tag_name.toLowerCase() === filteredRelease.tag_name.toLowerCase()
				|| release.tag_name.toLowerCase() === 'v' + filteredRelease.tag_name.toLowerCase()) {
				return filteredRelease;
			}
		}).length > 0;

		if (!containTagName) {
			filteredReleases.push(release);
		}
	});

	// Used for debug only
	data.dataAfterAggregation = JSON.stringify(filteredReleases.map(function(filteredRelease) {
		return filteredRelease.tag_name;
	}));

	return filteredReleases;
}

/**
 * Filter releases to keep releases with unique couple of date and version,
 * called to computed the case: multiple releases with same date and tag name = 1 release
 *
 * @param releases
 * @returns {*[]}
 */
function filterUniqueCoupleOfDateAndTagName(releases) {
	var filteredReleases = [];

	// Used for debug only
	data.dataBeforeAggregation = JSON.stringify(releases.map(function(release) {
		return release.released_at + '-' + release.tag_name;
	}));

	releases.forEach(function(release) {
		var containDateAndVersion = filteredReleases.filter(function(filteredRelease) {
			var dateAlreadyContained = formatDate(release.released_at) === formatDate(filteredRelease.released_at);
			var tagNameAlreadyContained = release.tag_name.toLowerCase() === filteredRelease.tag_name.toLowerCase()
				|| 'v' + release.tag_name.toLowerCase() === filteredRelease.tag_name.toLowerCase()
				|| release.tag_name.toLowerCase() === 'v' + filteredRelease.tag_name.toLowerCase();

			if (dateAlreadyContained && tagNameAlreadyContained) {
				return filteredRelease;
			}
		}).length > 0;

		if (!containDateAndVersion) {
			filteredReleases.push(release);
		}
	});

	// Used for debug only
	data.dataAfterAggregation = JSON.stringify(filteredReleases.map(function(filteredRelease) {
		return filteredRelease.released_at + '-' + filteredRelease.tag_name;
	}));

	return filteredReleases;
}
