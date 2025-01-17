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
	var projectID = WIDGET_PROJECT_ID_OR_PATH.replaceAll("/", "%2F");

	data.project = JSON.parse(
		Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN)).name;

	var response = JSON.parse(
		Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID + "/issues?state=" + WIDGET_ISSUES_STATE, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN, "X-Total"));

	data.numberOfIssues = response;

	if (SURI_PREVIOUS && JSON.parse(SURI_PREVIOUS).numberOfIssues) {
		data.evolution = ((data.numberOfIssues - JSON.parse(SURI_PREVIOUS).numberOfIssues) * 100 / JSON.parse(SURI_PREVIOUS).numberOfIssues).toFixed(1);
		data.arrow = data.evolution == 0 ? '' : (data.evolution > 0 ? "up" : "down");
	}

	if (WIDGET_ISSUES_STATE != 'all') {
		data.issuesState = WIDGET_ISSUES_STATE;
	}

	return JSON.stringify(data);
}