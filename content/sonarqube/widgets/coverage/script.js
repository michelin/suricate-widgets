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
	var branch = (WIDGET_BRANCH != null ? "branch=" + WIDGET_BRANCH + "&" : (WIDGET_PULL_REQUEST != null ? "pullRequest=" + WIDGET_PULL_REQUEST + "&" : ""));
	data.results = [];

	// Added to remove the trailing slash from the URL if present
	data.sonarConfigUrl = (CATEGORY_SONAR_URL) ? CATEGORY_SONAR_URL.replace(/\/+$/, '') : CATEGORY_SONAR_URL;

	var response = JSON.parse(Packages.get(data.sonarConfigUrl 
		+ "/api/measures/component?" + branch
		+ "component=" 
		+ WIDGET_PROJECT_KEY 
		+ "&additionalFields=metrics&metricKeys=" 
		+ WIDGET_METRICS,
    	"Authorization", "Basic " + Packages.btoa(CATEGORY_SONAR_TOKEN + ":")));
	
	print(JSON.stringify(response));
	if (response && response.component && response.component.measures && response.component.measures.length > 0) {
		response.component.measures.forEach(function(measure) {
			data.results.push({
				title: response.metrics.filter(function(metric) {
							if (metric.key == measure.metric) {
								return metric;
							} 
						})[0].name,
				value: measure.periods[0].value,

			});
		});

	}

  return JSON.stringify(data);
}