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
  // previous data
  var data = JSON.parse(SURI_PREVIOUS);
  var jsonResponse = Packages.get(CATEGORY_JIRA_URL + "/rest/api/2/search?jql=" + encodeURIComponent(WIDGET_JQL) + "&maxResults=0", "Authorization", "Bearer " + CATEGORY_JIRA_TOKEN);
  if (jsonResponse == null) {
    return null;
  }
  var jsonObject = JSON.parse(jsonResponse);

  if (data.old === undefined) {
    data.old = [];
  }

  if (data.old.length !== 0) {
    if (data.old[0].time < new Date().getTime() - WIDGET_DELAY * 3600000) {
      data.old.shift();
    }
  }

  var value = {};
  value.data = data.currentValue;
  value.time = new Date().getTime();
  data.old.push(value);

  data.currentValue = jsonObject.total;
  var diff = (((data.currentValue - data.old[0].data) * 100) / data.old[0].data);
  if (isNaN(diff)) {
    diff = 0;
  }

  if (data.currentValue == null) {
    data.old.shift();
  }

  data.difference = diff.toFixed(1) + "%";
  data.arrow = diff === 0 ? '' : (diff > 0 ? "up" : "down");

  return JSON.stringify(data);
}
