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
	var users = [];
	var page = 1;
	
	var url = CATEGORY_GITLAB_URL + "/api/v4/users?per_page=100";
	
	// Filter on user's name
	if (WIDGET_FILTER_BY_NAME) {
		url += "&search=" + WIDGET_FILTER_BY_NAME;
	}
	
	if (WIDGET_FILTER_BY_STATE) {
		if (WIDGET_FILTER_BY_STATE === 'active') {
			url += "&active=true";
		} else {
			if (WIDGET_FILTER_BY_STATE === 'blocked') {
				url += "&blocked=true";
			}
		}
	}
	
	var response = JSON.parse(Packages.get(url + "&page=" + page, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));
	
	// Custom filter on identifier to handle 3 chars or less
	if (WIDGET_FILTER_BY_ID) {
		users = response.filter(filterById);
	} else {
		users = response;
	}
		
	while (response && response !== null && response.length > 0) {
		page++;

		response = JSON.parse(Packages.get(url + "&page=" + page, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));
		
		// Custom filter on identifier to handle 3 chars or less
		if (WIDGET_FILTER_BY_ID) {
			users = users.concat(response.filter(filterById));
		} else {
			users = users.concat(response);
		}
	}
	
	data.countUsers = users.map(function(user) {
		return user.username;
	}).filter(onlyUnique).length;

	if (SURI_PREVIOUS && JSON.parse(SURI_PREVIOUS).countUsers) {
		data.evolution = ((data.countUsers - JSON.parse(SURI_PREVIOUS).countUsers) * 100 / JSON.parse(SURI_PREVIOUS).countUsers).toFixed(1);
		data.arrow = data.evolution == 0 ? '' : (data.evolution > 0 ? "up" : "down");
	}
	
	return JSON.stringify(data);
}

function filterById(user) {
	if (user.username.toLowerCase().indexOf(WIDGET_FILTER_BY_ID.toLowerCase()) > -1) {
		return user;
	}
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
