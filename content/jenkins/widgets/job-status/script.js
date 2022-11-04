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
  var jsonResponse = Packages.get(WIDGET_CONFIG_JENKINS_URL + "/job/" + SURI_JOB + "/lastBuild/api/json", "Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_JENKINS_USER + ":" + WIDGET_CONFIG_JENKINS_PASSWORD));

  if (jsonResponse === null) {
    return null;
  }

  var display_mode = "upstream";
  if (typeof SURI_DISPLAY_MODE !== 'undefined' && SURI_DISPLAY_MODE !== "") {
    display_mode = SURI_DISPLAY_MODE;
  }

  // Convert String to object
  var jsonObject = JSON.parse(jsonResponse);
  var user = "";

  for (var i in jsonObject.actions) {
    if (jsonObject.actions[i].hasOwnProperty("causes")) {
      for (var j in jsonObject.actions[i].causes) {
        if (jsonObject.actions[i].causes[j].hasOwnProperty("shortDescription")) {
          if (jsonObject.actions[i].causes[j].hasOwnProperty("userId")) {
            data.builtBy = jsonObject.actions[i].causes[j].userId;
            user = data.builtBy;
          } else if (jsonObject.actions[i].causes[j].hasOwnProperty("userName")) {
            data.builtBy = jsonObject.actions[i].causes[j].userName;
            user = data.builtBy;
          } else if (jsonObject.actions[i].causes[j].hasOwnProperty("upstreamProject")) {
            data.builtBy = 'upstream ' + jsonObject.actions[i].causes[j].upstreamProject;
          } else if (jsonObject.actions[i].causes[j].hasOwnProperty("addr")) {
            data.builtBy = 'remote ' + jsonObject.actions[i].causes[j].addr;
          } else {
            var myString = jsonObject.actions[i].causes[j].shortDescription;
            var myRegexp = /(timer|alarme)/g;
            var match = myRegexp.exec(myString);

            if (match !== null) {
              data.builtBy = match[0];
            } else {
              data.builtBy = "N/A";
            }
          }
        }
      }
    }
  }

  //if display mode is user, use it if it was found in json
  if (display_mode === "user" && user !== "") {
    data.builtBy = user;
  }

  if (data.builtBy === null) {
    data.builtBy = "N/A";
  }

  data.builtOn = jsonObject.builtOn;
  data.result = jsonObject.result;
  data.success = jsonObject.result === "SUCCESS";
  data.failure = jsonObject.result === "FAILURE";
  data.unstable = jsonObject.result === "UNSTABLE";

  data.durationSeconds = Math.round(jsonObject.duration / 1000);

  if (data.durationSeconds > 200) {
    data.durationMinutes = Math.round(data.durationSeconds / 60);
  }

  data.building = jsonObject.building === true;

  var date = new Date(jsonObject.timestamp);
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
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  var formattedDate = day + '/' + month + '/' + year;

  data.formattedTime = formattedTime;
  data.formattedDate = formattedDate;

  return JSON.stringify(data);
}
