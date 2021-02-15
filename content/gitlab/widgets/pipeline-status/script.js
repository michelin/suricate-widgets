/*
  * Copyright 2012-2018 the original author or authors.
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

	data.project = JSON.parse(
		Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN)).name;

	var url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/pipelines?per_page=100&page=1";
	
	if (SURI_PROJECT_BRANCH) {
		url += "&ref=" + SURI_PROJECT_BRANCH;
	}
	
	var pipelines = JSON.parse(Packages.get(url, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
	
	if (pipelines && pipelines.length > 0) {
		data.status = pipelines[0].status;
		
		var pipeline = JSON.parse(
			Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/pipelines/" + pipelines[0].id + "?per_page=100&page=1", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
	
		data.name = pipeline.user.name;
		data.username = pipeline.user.username;
		data.branch = SURI_PROJECT_BRANCH;
		
		if (data.status === 'success') {
			data.success = true;
		} else if (data.status === 'failed') {
			data.failed = true;
		} else if (data.status === 'running') {
			data.running = true;
		} else {
			data.otherStatus = true;
		}
	}
		
	return JSON.stringify(data);
}