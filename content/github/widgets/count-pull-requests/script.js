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
	var perPage = 100;
	var pullRequests = [];
	var page = 1;
	
	var response = JSON.parse(
					Packages.get("https://api.github.com/repos/" + WIDGET_GITHUB_ORGANIZATION + "/" + WIDGET_GITHUB_PROJECT + "/issues?page=" + page + "&per_page=" + perPage + "&state=" + WIDGET_GITHUB_PULL_REQUESTS_STATE,
					"Authorization", "token " + CATEGORY_GITHUB_TOKEN));
	
	pullRequests = pullRequests.concat(response);

	while (response && response.length > 0 && response.length === perPage) {
		page++;
		
		response = JSON.parse(
					Packages.get("https://api.github.com/repos/" + WIDGET_GITHUB_ORGANIZATION + "/" + WIDGET_GITHUB_PROJECT + "/issues?page=" + page + "&per_page=" + perPage + "&state=" + WIDGET_GITHUB_PULL_REQUESTS_STATE,
					"Authorization", "token " + CATEGORY_GITHUB_TOKEN));
		
		pullRequests = pullRequests.concat(response);
	}
	
	// The response contains the issues and the pull requests. Here, we only keep the real pull requests
	pullRequests = pullRequests.filter(function(pullRequest) {
		if (pullRequest.pull_request) {
			return pullRequest;
		}
	});
	
	data.numberOfPRs = pullRequests.length;
	
	if (SURI_PREVIOUS) {
		if (JSON.parse(SURI_PREVIOUS).numberOfPRs) {
			data.evolution = ((data.numberOfPRs - JSON.parse(SURI_PREVIOUS).numberOfPRs) * 100 / JSON.parse(SURI_PREVIOUS).numberOfPRs).toFixed(1);
		} else {
			data.evolution = (0).toFixed(1);
		}
		
		data.arrow = data.evolution == 0 ? '' : (data.evolution > 0 ? "up" : "down");
	}
	
	if (WIDGET_GITHUB_PULL_REQUESTS_STATE != 'all') {
		data.prsState = WIDGET_GITHUB_PULL_REQUESTS_STATE;
	}
	
	return JSON.stringify(data);
}
