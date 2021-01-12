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
  data.jenkinsJobUrl = WIDGET_CONFIG_JENKINS_URL + '/job/' + SURI_JOB;
  var jsonResponse = Packages.call(data.jenkinsJobUrl + "/api/json?tree=builds[url,number,status,timestamp,id,result,duration,building]", null, null, null);

  if (jsonResponse === null) {
    return null;
  }
  var jsonAsObject = JSON.parse(jsonResponse);
  data.items = jsonAsObject.builds;
  for (var i in data.items) {

    // ****  Format date ***** //
    var date = new Date(data.items[i].timestamp);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    data.items[i].formattedDate = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    // ****  Format duration ***** //
    var duration = data.items[i].duration;

    seconds = parseInt((duration / 1000) % 60);
    minutes = parseInt((duration / (1000 * 60)) % 60);
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    data.items[i].formattedDuration = hours + ':' + minutes + ':' + seconds;

    // **** Format if job is currently running ****
    if (data.items[i].building) {
      data.items[i].result = 'RUNNING';
      data.items[i].formattedDuration = '';
    }

  }

  return JSON.stringify(data);
}