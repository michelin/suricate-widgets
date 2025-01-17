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

function compareRelease(a, b) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

function run() {
  var jsonResponse = Packages.get(CATEGORY_JIRA_URL + "/rest/api/2/project/" + encodeURIComponent(WIDGET_PROJECT) + "/versions", "Authorization", "Bearer " + CATEGORY_JIRA_TOKEN);
  if (jsonResponse == null) {
    return null;
  }
  var jsonObject = JSON.parse(jsonResponse);

  var data = {};
  array = [];
  for (var i in jsonObject) {
    var releaseDate = new Date(jsonObject[i].releaseDate);
    var maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 5);
    if (releaseDate > new Date() && releaseDate < maxDate) {
      var obj = {};
      obj.name = jsonObject[i].name;
      obj.date = jsonObject[i].releaseDate;
      array.push(obj);
    }
  }

  array.sort(compareRelease);

  data.data = JSON.stringify(array);
  return JSON.stringify(data);
}
