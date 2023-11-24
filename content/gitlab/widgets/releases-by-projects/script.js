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
	var releases = [];
	var projectsByNumberOfDeployments = [];
	var oldestReleaseDate = new Date();
	data.apps = {};
	data.apps.values = [];

	data.fromDate = computeStartDate();

	var projectIDs = SURI_PROJECT.split(",").replaceAll("/", "%2F");

	projectIDs.forEach(function(id) {
		releases = []

		var project = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		var response = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id + "/releases?per_page=" + perPage + "&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		releases = releases.concat(response);

		while (response && response.length > 0 && response.length === perPage) {
			page++;

			response = JSON.parse(
				Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + id + "/releases?per_page=" + perPage + "&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

			releases = releases.concat(response);
		}

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

			if (new Date(oldestReleaseDate) > new Date(releases[0].released_at)) {
				oldestReleaseDate = formatDate(releases[0].released_at);
			}

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
		}

		projectsByNumberOfDeployments.push({
			"name": project.name,
			"nbReleases": releases.length
		});
	});

	if (SURI_ORDER_BY) {
		if (SURI_ORDER_BY === "PROJECT_NAME") {
			projectsByNumberOfDeployments.sort(orderByProjectName);
		} else {
			projectsByNumberOfDeployments.sort(orderByNumberOfReleases);
		}
	}

	if (!data.fromDate) {
		data.fromDate = oldestReleaseDate;
	}

	projectsByNumberOfDeployments.forEach(function(application, index) {
		data.apps.values[index] = JSON.stringify(projectsByNumberOfDeployments[index]);
	});

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
 * Order by project name
 *
 * @param a The first project
 * @param b The second project
 * @returns {number}
 */
function orderByProjectName(a, b) {
	if (a.name < b.name) {
		return -1;
	}

	if (a.name > b.name) {
		return 1;
	}

	return 0;
}

/**
 * Order by number of releases
 *
 * @param a The first project
 * @param b The second project
 * @returns {number}
 */
function orderByNumberOfReleases(a, b) {
	if (a.nbReleases > b.nbReleases) {
		return -1;
	}

	if (a.nbReleases < b.nbReleases) {
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

/**
 * Order the releases by date
 *
 * @param firstRelease The first release
 * @param secondRelease The second release
 * @returns {number}
 */
function orderReleasesByDate(firstRelease, secondRelease) {
	if (new Date(firstRelease.released_at) < new Date(secondRelease.released_at)){
		return -1;
	}

	if (new Date(firstRelease.released_at) > new Date(secondRelease.released_at)){
		return 1;
	}

	return 0;
}
