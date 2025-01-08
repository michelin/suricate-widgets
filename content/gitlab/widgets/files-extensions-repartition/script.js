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

	data.labels = [];
	data.datapie = [];
	data.colors = [];
	data.border = [];
	var projectID = SURI_PROJECT.replaceAll("/", "%2F");

	var json = JSON.parse(Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID + "/languages", "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

	if (json) {
		data.labels = Object.keys(json);
		data.datapie = Object.keys(json).map(function(key){return json[key]})

		data.labels.forEach(function(label) {
			data.colors.push(stringToColour("COLOR" + label));
			data.border.push("#607D8B");
		});

		data.colors = JSON.stringify(data.colors);
		data.labels = JSON.stringify(data.labels);
		data.datapie = JSON.stringify(data.datapie);
		data.border = JSON.stringify(data.border);
	}

	return JSON.stringify(data);
}

function stringToColour(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var colour = '#';
	for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	}
	return colour;
};
