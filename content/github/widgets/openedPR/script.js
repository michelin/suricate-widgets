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

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function run() {
  // previous data
  var data = JSON.parse(SURI_PREVIOUS);
  if (data == null) {
    data = {};
  }

  var raw = Packages.call("https://api.github.com/repos/" + GITHUB_ORG + "/" + GITHUB_PROJECT, null, null, null);
  data.projectName = JSON.parse(raw).name;

  raw = Packages.call("https://api.github.com/repos/" + GITHUB_ORG + "/" + GITHUB_PROJECT + "/pulls", null, null, null);
  var number = JSON.parse(raw).length;

  if (number == null) {
    if (data.currentValue == null) {
      return data;
    }
    number = data.currentValue;
  }

  if (data.old == undefined) {
    data.old = [];
  }

  if (data.old.length != 0) {
    if (data.old[0].time < new Date().getTime() - SURI_DELAI * 3600000) {
      data.old.shift();
    }
  }

  var value = {};
  value.data = data.currentValue;
  if (isNaN(value.data)) {
    value.data = number;
  }
  value.time = new Date().getTime();
  data.old.push(value);

  data.currentValue = number;
  var diff = (((number - data.old[0].data) * 100) / data.old[0].data);
  if (isNaN(diff)) {
    diff = 0;
  }

  if (data.currentValue == null) {
    data.old.shift();
  }

  data.difference = diff.toFixed(1) + "%";
  data.arrow = diff == 0 ? '' : (diff > 0 ? "up" : "down");

  return JSON.stringify(data);
}