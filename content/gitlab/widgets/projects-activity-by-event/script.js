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
	var data = {};

	data.labels = [];
	data.datapie = [];
	data.colors = [];

	// To retrieve the events of today, GitLab seems to require the date of yesterday
	data.fromDate = new Date().getFullYear() + "-" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "-" + ("0" + new Date().getUTCDate()).slice(-2);

	var today = new Date();
	today.setDate(today.getDate() - 1);
	var todayForGitLabString = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getUTCDate()).slice(-2);

	if (WIDGET_DATE && WIDGET_DATE !== null) {
		data.fromDate = WIDGET_DATE.slice(4) + "-" + WIDGET_DATE.slice(2, 4) + "-" + WIDGET_DATE.slice(0, 2);
		var givenDate = new Date(data.fromDate);
		givenDate.setDate(givenDate.getDate() - 1);

		todayForGitLabString = givenDate.getFullYear() + "-" + ("0" + (givenDate.getMonth() + 1)).slice(-2) + "-" + ("0" + givenDate.getUTCDate()).slice(-2);
	}

	var urlParameters = "?per_page=100&after=" + todayForGitLabString;

	if (WIDGET_EVENT_TYPE && WIDGET_EVENT_TYPE !== null) {
		data.action = WIDGET_EVENT_TYPE.charAt(0).toUpperCase() + WIDGET_EVENT_TYPE.substring(1).toLowerCase();
		if (WIDGET_EVENT_TYPE !== 'all') {
			urlParameters += "&action=" + WIDGET_EVENT_TYPE;
		}
	}

	if (WIDGET_TARGET_TYPE && WIDGET_TARGET_TYPE !== null) {
		data.target = WIDGET_TARGET_TYPE.charAt(0).toUpperCase() + WIDGET_TARGET_TYPE.substring(1).toLowerCase();
		if (WIDGET_TARGET_TYPE !== 'all') {
			urlParameters += "&target_type=" + WIDGET_TARGET_TYPE;
		}
	}

	var projects = [];
	if (WIDGET_PROJECT_IDS_OR_PATHS && WIDGET_PROJECT_IDS_OR_PATHS !== null) {
		projectIds = WIDGET_PROJECT_IDS_OR_PATHS.replaceAll("/", "%2F").split(",");

		projectIds.forEach(function(projectId) {
			projects.push(JSON.parse(Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectId, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN)));
		});
	} else {
		var numberOfProjects = 5;
		if (WIDGET_NUMBER_OF_PROJECTS && WIDGET_NUMBER_OF_PROJECTS !== null) {
			numberOfProjects = WIDGET_NUMBER_OF_PROJECTS;
		}

		projects = JSON.parse(Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects?order_by=last_activity_at&per_page=" + numberOfProjects, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));
	}

	if (projects && projects !== null && projects.length > 0) {
		projects.forEach(function(project) {
			data.labels.push(project.name);
			data.colors.push(stringToColour(project.name));

			var events = JSON.parse(Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + project.id + "/events" + urlParameters, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

			if (events && events !== null && events.length > 0) {
				data.datapie.push(events.length);
			} else {
				data.datapie.push(events.length);
			}
		});
	}

	data.colors = JSON.stringify(data.colors);
	data.labels = JSON.stringify(data.labels);
	data.datapie = JSON.stringify(data.datapie);

	return JSON.stringify(data);
}

function stringToColour(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var colour = '#';
	for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	}
	return colour;
};
