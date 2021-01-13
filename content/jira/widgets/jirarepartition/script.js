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
  // previous data
  var data = {};
  data.unassigned = 0;
  data.resolved = 0;
  data.total = 0;

  var jsonResponse = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql=" + encodeURIComponent(SURI_JQL) + "&fields=summary,status,assignee", "Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_JIRA_USER + ":" + WIDGET_CONFIG_JIRA_PASSWORD), null);
  if (jsonResponse == null) {
    return null;
  }
  var jsonObject = JSON.parse(jsonResponse);

  var array = [];
  data.total = jsonObject.issues.length;

  for (var i in jsonObject.issues) {
    var ele = {};
    ele.key = jsonObject.issues[i].key;
    ele.summary = jsonObject.issues[i].fields.summary;
    ele.status = jsonObject.issues[i].fields.status.name;
    ele.color = jsonObject.issues[i].fields.status.statusCategory.colorName;
    ele.assignee = jsonObject.issues[i].fields.assignee;

    if (ele.assignee === null) {
      data.unassigned++;

    } else {
      if (ele.status === "Closed" || ele.status === "Implemented") {
        data.resolved++;
      }
    }
    array.push(ele);
  }

  data.items = array;

  return JSON.stringify(data);
}