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
	
	var runner = JSON.parse(Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/runners/" + SURI_RUNNER, 
		"PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
	
	if (runner) {
		data.name = runner.description;
		data.status = runner.status;
		data.contactedAt = formatDate(runner.contacted_at);
		data.platform = runner.platform;
		data.architecture = runner.architecture;
		data.version = runner.version;
		
		var durationInSecondsSinceLastContact = (new Date().getTime() - new Date(runner.contacted_at).getTime()) / 1000;
		data.contactedAtDuration = secondsToDuration(durationInSecondsSinceLastContact);
		
		if (SURI_LAST_CONTACT_DURATION) {			
			var lastContactDurationSeconds = SURI_LAST_CONTACT_DURATION * 60;
			
			if (durationInSecondsSinceLastContact > lastContactDurationSeconds) {
				data.lastContactExceeded = true;
			}
		}
		
		if (data.status === 'active') {
			data.active = true;
		} else if (data.status === 'paused') {
			data.paused = true;
		} else if (data.status === 'online') {
			data.online = true;
		} else if (data.status === 'offline') {
			data.offline = true;
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