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
	var oldestReleaseDate = new Date();
	data.datasets = [];
	data.projectNames = '';

	data.fromDate = computeStartDate();

	var projectIDs = WIDGET_PROJECT_IDS_OR_PATHS.replaceAll("/", "%2F").split(",");

	projectIDs.forEach(function(id, index) {
		releases = [];

		var project = JSON.parse(
			Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + id, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

		data.projectNames += project.name + ", ";

		var response = JSON.parse(
			Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + id + "/releases?per_page=" + perPage + "&page=" + page, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

		releases = releases.concat(response);

		while (response && response.length > 0 && response.length === perPage) {
			page++;

			response = JSON.parse(
				Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + id + "/releases?per_page=" + perPage + "&page=" + page, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

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

			var deploymentsDate = releases.map(function (release) {
				return formatDate(new Date(release.released_at));
			});

			data.datasets.push(JSON.stringify({
				label: project.name,
				data: deploymentsDate.filter(onlyUnique).map(function (uniqueReleaseDate) {
					var releasesSameDate = releases.filter(function (release) {
						if (formatDate(new Date(release.released_at)) === uniqueReleaseDate) {
							return release;
						}
					});

					var deployedReleaseNames = '';

					releasesSameDate.forEach(function (release) {
						deployedReleaseNames += release.name + ', ';
					});

					deployedReleaseNames = deployedReleaseNames.slice(0, -2);

					return {
						x: new Date(uniqueReleaseDate),
						y: releasesSameDate.length,
						deployedReleaseNames: deployedReleaseNames
					};
				}),
				backgroundColor: getColorForTrigram(index, '0.2'),
				borderColor: getColorForTrigram(index, '0.6'),
				pointBackgroundColor: getColorForTrigram(index, '1'),
				pointBorderColor: getColorForTrigram(index, '0.6'),
				pointBorderWidth: 10
			}));
		}
	});

	if (WIDGET_DISPLAY_TICKS_FOR_RELEASES && WIDGET_DISPLAY_TICKS_FOR_RELEASES === 'true') {
		data.displayTicksForReleases = true;
	}

	if (WIDGET_DISPLAY_RELEASES_NAMES && WIDGET_DISPLAY_RELEASES_NAMES === 'true') {
		data.displayDeployedReleasesNames = true;
	}

	if (!data.fromDate) {
		data.fromDate = oldestReleaseDate;
	}

	data.projectNames = data.projectNames.slice(0, -2);
	data.datasets = JSON.stringify(data.datasets);

	return JSON.stringify(data);
}

/**
 * Compute the start date of the releases from the widget parameters
 * @returns {string}
 */
function computeStartDate() {
	if (WIDGET_DATE) {
		return WIDGET_DATE.slice(4) + "-" + WIDGET_DATE.slice(2, 4) + "-" + WIDGET_DATE.slice(0, 2);
	}

	if (WIDGET_PERIOD_UNIT) {
		var numberOfPeriods = 1;
		if (WIDGET_PERIOD_NUMBER) {
			numberOfPeriods = WIDGET_PERIOD_NUMBER;
		}

		var computedDate = new Date();

		if (WIDGET_PERIOD_UNIT === "day") {
			computedDate.setDate(new Date().getDate() - numberOfPeriods);
		} else if (WIDGET_PERIOD_UNIT === "week") {
			computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
		} else if (WIDGET_PERIOD_UNIT === "month") {
			computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
		} else if (WIDGET_PERIOD_UNIT === "year") {
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
