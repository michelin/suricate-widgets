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

	if (!SURI_SEARCH_BY_IDENTIFIER) {
		var url = WIDGET_CONFIG_JENKINS_URL + "/asynchPeople/api/json?tree=users[lastChange]";
	} else {
		var url = WIDGET_CONFIG_JENKINS_URL + "/asynchPeople/api/json?tree=users[user[id],lastChange]"
	}

	var json = JSON.parse(Packages.get(url, "Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_JENKINS_USER + ":" + WIDGET_CONFIG_JENKINS_PASSWORD)));

	if (SURI_DATE) {
		data.date = SURI_DATE.toString().slice(4) + "-" + SURI_DATE.toString().slice(2, 4) + "-" + SURI_DATE.toString().slice(0, 2);
		
		json.users = json.users.filter(function(user) {
			if (user.lastChange > Date.parse(data.date)) {
				return user;
			}
		});
	}
	
	if (SURI_SEARCH_BY_IDENTIFIER) {
		json.users = json.users.filter(function(user) {
			if (user.user.id.toLowerCase().indexOf(SURI_SEARCH_BY_IDENTIFIER.toLowerCase()) > -1) {
				return user;
			}
		});
	}
	
	data.countUsers = json.users.length;
	
	if (SURI_PREVIOUS && JSON.parse(SURI_PREVIOUS).countUsers) {
		data.evolution = ((data.countUsers - JSON.parse(SURI_PREVIOUS).countUsers) * 100 / JSON.parse(SURI_PREVIOUS).countUsers).toFixed(1);
		data.arrow = data.evolution == 0 ? '' : (data.evolution > 0 ? "up" : "down");
	}
	
	return JSON.stringify(data);
}
