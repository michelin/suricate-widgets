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
	var data = {};
	var issues = [];
	var page = 1;
	var projectID = SURI_PROJECT.replaceAll("/", "%2F");

	data.project = JSON.parse(
		Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + projectID, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN)).name;

	var response = JSON.parse(
		Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + projectID + "/issues?per_page=" + perPage + "&page=" + page + "&state=" + SURI_ISSUES_STATE, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

	issues = issues.concat(response);

	while (response && response.length > 0 && response.length === perPage) {
		page++;

		response = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + projectID + "/issues?per_page=" + perPage + "&page=" + page + "&state=" + SURI_ISSUES_STATE, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		issues = issues.concat(response);
	}

	data.numberOfIssues = issues.length;

	if (SURI_PREVIOUS && JSON.parse(SURI_PREVIOUS).numberOfIssues) {
		data.evolution = ((data.numberOfIssues - JSON.parse(SURI_PREVIOUS).numberOfIssues) * 100 / JSON.parse(SURI_PREVIOUS).numberOfIssues).toFixed(1);
		data.arrow = data.evolution == 0 ? '' : (data.evolution > 0 ? "up" : "down");
	}

	if (SURI_ISSUES_STATE != 'all') {
		data.issuesState = SURI_ISSUES_STATE;
	}

	return JSON.stringify(data);
}