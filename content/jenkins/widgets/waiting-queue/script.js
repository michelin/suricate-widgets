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
  var now_timestamp = Date.now();
  var data = {};
  var jsonResponse = Packages.get(WIDGET_CONFIG_JENKINS_URL + "/jenkins/queue/api/json");
  if (jsonResponse == null) {
    return null;
  }
  // Convert String to object
  var jsonObject = JSON.parse(jsonResponse);

  data.nbWaitingJobs = 0;
  data.limit = SURI_LIMIT;

  for (var i in jsonObject.items) {
    var waitingDuration = (now_timestamp - jsonObject.items[i].inQueueSince) / 60000; //minutes
    if (waitingDuration > data.limit) {
      data.nbWaitingJobs++;
    }
  }
  data.ok = (data.nbWaitingJobs < SURI_CRITICAL_LIMIT);
  return JSON.stringify(data);
}