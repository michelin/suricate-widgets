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
	var url;
	var perPage = 100;
	var page = 1;
	var runners = [];
	var toReturn = [];
	
	var isAdmin = JSON.parse(
		Packages.get(CATEGORY_GITLAB_URL + "/api/v4/user", "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN)).is_admin;
	
	var runnersURL = CATEGORY_GITLAB_URL + "/api/v4/runners";
	
	if (isAdmin) {
		runnersURL += "/all";
	}
	
	runnersURL += "?per_page=" + perPage + "&page=" + page;
	
	if (SURI_RUNNER_TAGS && SURI_RUNNER_TAGS.split(",").length > 0) {
		runnersURL += "&tag_list=" + SURI_RUNNER_TAGS;
	}
	
	var response = JSON.parse(Packages.get(runnersURL, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));
	
	runners = runners.concat(response);
	
	while (response && response.length > 0 && response.length === perPage) {
		page++;
		var previousPage = page - 1;
		
		runnersURL = runnersURL.replace("&page=" + previousPage, "&page=" + page);
				
		response = JSON.parse(Packages.get(runnersURL, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));
		
		runners = runners.concat(response);
	}
	
	if (SURI_RUNNERS_NAME && SURI_RUNNERS_NAME.split(",").length > 0) {
		runners = runners.filter(function(runner) {
			var runnerMatchingToGivenNames;
			
			SURI_RUNNERS_NAME.split(",").forEach(function(runnerName) {
				if (runner.description && runner.description.toLowerCase().indexOf(runnerName.toLowerCase()) > -1) {
					runnerMatchingToGivenNames = runner;
				}
			});
			
			return runnerMatchingToGivenNames;
		});
	}
	
	runners.forEach(function(runner) {
		var item = {};
		
		item.description = runner.description;
		item.status = runner.status;
		
		if (runner.status === 'active') {
            item.active = true;
        } else if (runner.status === 'paused') {
            item.paused = true;
        } else if (runner.status === 'online') {
            item.online = true;
		} else if (runner.status === 'offline') {
            item.offline = true;
        } else if (runner.status === 'stale') {
            item.stale = true;
        } 
		
		toReturn.push(item);
	});
	
	if (toReturn.length > 0) {
		data.items = toReturn;
	}
	
	if (SURI_HIGHLIGHT_OFFLINE_RUNNERS && SURI_HIGHLIGHT_OFFLINE_RUNNERS === 'true') {
		data.highlightOfflineRunners = true;
	}
	
	return JSON.stringify(data);
}
