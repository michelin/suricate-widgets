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
	
	var url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/users?per_page=100";
	
	// Filter on user's name
	if (SURI_SEARCH_BY_NAME) {
		url += "&search=" + SURI_SEARCH_BY_NAME;
	}
	
	if (SURI_STATE) {
		if (SURI_STATE === 'active') {
			url += "&active=true";
		} else {
			if (SURI_STATE === 'blocked') {
				url += "&blocked=true";
			}
		}
	}
	
	var response = JSON.parse(Packages.get(url + "&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
	
	// Custom filter on identifier to handle 3 chars or less
	if (SURI_SEARCH_BY_IDENTIFIER) {
		users = response.filter(filterByIdentifiant);
	} else {
		users = response;
	}
		
	while (response && response !== null && response.length > 0) {
		page++;

		response = JSON.parse(Packages.get(url + "&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
		
		// Custom filter on identifier to handle 3 chars or less
		if (SURI_SEARCH_BY_IDENTIFIER) {
			users = users.concat(response.filter(filterByIdentifiant));
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

function filterByIdentifiant(user) {
	if (user.username.toLowerCase().indexOf(SURI_SEARCH_BY_IDENTIFIER.toLowerCase()) > -1) {
		return user;
	}
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
