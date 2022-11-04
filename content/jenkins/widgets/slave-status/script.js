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
	var reg = null;
	
	var data = {};
	data.nbUp = 0;
	data.nbDown = 0;
	data.total = 0;
	data.slave = [];

	var jsonResponse = Packages.get(WIDGET_CONFIG_JENKINS_URL + "/computer/api/json", "Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_JENKINS_USER + ":" + WIDGET_CONFIG_JENKINS_PASSWORD));
	if (jsonResponse == null) {
		return null;
	}

	var jsonObject = JSON.parse(jsonResponse);

	if (SURI_REGEX != null) {
		reg = "^" + SURI_REGEX + "$";
	} else {
		reg = ".*";
	}

	for (var i in jsonObject.computer) {
		if (jsonObject.computer[i].displayName.match(reg)) {
			if (jsonObject.computer[i].offline || jsonObject.computer[i].temporarilyOffline) {
				var slave = {};
				slave.name = jsonObject.computer[i].displayName;
				
				if (jsonObject.computer[i].offlineCauseReason !== undefined) {
					var cause = jsonObject.computer[i].offlineCauseReason.replace(/<(?:.|\n)*?>/gm, '');
					slave.offlineCause = cause.split('\n')[0];
				}
				
				data.nbDown++;
				data.slave.push(slave);
			} else {
				data.nbUp++;
			}
		}
	}

	if (data.nbUp === 0) {
		Packages.throwFatalError("Error no slave found for Regex :" + reg);
	}

	data.total = data.nbDown + data.nbUp;
	data.ok = data.total === data.nbUp;
	data.minimal = data.nbDown > 5;

	return JSON.stringify(data);
}
