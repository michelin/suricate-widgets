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
  var jsonResponseAll = Packages.get(CATEGORY_JIRA_URL + "/rest/api/2/search?jql=" + encodeURIComponent(WIDGET_JQL_ALL) + "&maxResults=0", "Authorization", "Bearer " + CATEGORY_JIRA_TOKEN);
  if (jsonResponseAll == null) {
    return null;
  }
  var jsonResponseClosed = Packages.get(CATEGORY_JIRA_URL + "/rest/api/2/search?jql=" + encodeURIComponent(WIDGET_JQL_CLOSED) + "&maxResults=0", "Authorization", "Bearer " + CATEGORY_JIRA_TOKEN);
  if (jsonResponseClosed == null) {
    return null;
  }

  var jsonObjectClosed = JSON.parse(jsonResponseClosed);
  var jsonObjectAll = JSON.parse(jsonResponseAll);
  var value = (jsonObjectClosed.total * 100) / jsonObjectAll.total;

  data.valueCountSelect = jsonObjectClosed.total;
  data.valueCountAll = jsonObjectAll.total;
  data.value = isNaN(value) ? 0 : value.toFixed(0);
  data.displayCount = !(typeof WIDGET_DISPLAY_COUNT === 'undefined' || WIDGET_DISPLAY_COUNT === "false");

  return JSON.stringify(data);
}
