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
	
	var url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/runners";
	
	if (SURI_RUNNER_TAGS && SURI_RUNNER_TAGS.split(",").length > 0) {
		url += "?tag_list=" + SURI_RUNNER_TAGS;
	}
	
	var runners = JSON.parse(Packages.get(url, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
	
	var response = [];
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
        } 
		
		response.push(item);
	});
	
	if (response.length > 0) {
		data.items = response;
	}
	
	return JSON.stringify(data);
}