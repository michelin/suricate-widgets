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
		data.branch = pipeline.ref;
		data.url = pipeline.web_url;
		data.createdAt = formatDate(pipeline.created_at);
		
		if (pipeline.duration) {
            data.duration = secondsToDuration(pipeline.duration);
        } else {
			data.duration = 'N/A';
		}
		
		if (pipeline.started_at) {
			data.waitingTimeBeforeStarting = secondsToDuration((new Date(pipeline.started_at).getTime() - new Date(pipeline.created_at).getTime()) / 1000);
		} else {
			data.waitingTimeBeforeStarting = secondsToDuration((new Date().getTime() - new Date(pipeline.created_at).getTime()) / 1000) + (' (not started yet)');
		}
		
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

function secondsToDuration(duration) {
    var hours = Math.floor(duration / 3600);
    var minutes = Math.floor(duration / 60 ) - (hours * 60);
    var seconds = Math.floor(duration % 60);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + 'h ' + minutes + 'min ' + seconds + 's';
}

function formatDate(date) {
    var hours = new Date(date).getHours() < 10 ? "0" + new Date(date).getHours() : new Date(date).getHours();
    var minutes = new Date(date).getMinutes() < 10 ? "0" + new Date(date).getMinutes() : new Date(date).getMinutes();
    var seconds = new Date(date).getSeconds() < 10 ? "0" + new Date(date).getSeconds() : new Date(date).getSeconds();
	
	return new Date(date).getFullYear() 
			+ "-" 
			+ ("0" + (new Date(date).getMonth() + 1)).slice(-2) 
			+ "-" 
			+ ("0" + new Date(date).getUTCDate()).slice(-2)
			+ " at "
			+ hours
			+ ":"
			+ minutes
			+ ":"
			+ seconds;
}
