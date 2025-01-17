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
	
	var pods = JSON.parse(
		Packages.get(WIDGET_CONFIG_KUBERNETES_API_SERVER + "/api/v1/namespaces/" + WIDGET_NAMESPACE + "/pods?limit=500", 
					 "Authorization", 
					 "Bearer " + WIDGET_SERVICE_ACCOUNT_TOKEN));
	
	if (WIDGET_STATUS && WIDGET_STATUS != 'All') {
		data.status = WIDGET_STATUS;
		pods.items = pods.items.filter(function(pod) {
			if (pod.status.phase === WIDGET_STATUS) {
				return pod;
			}
		});
	}
	
	if (WIDGET_PODS_NAME) {
		pods.items = pods.items.filter(function(pod) {
			if (pod.metadata.name.indexOf(WIDGET_PODS_NAME) > -1) {
				return pod;
			}
		});
	}
			
	var response = [];
	pods.items.forEach(function(item) {
		response.push({
			"name": item.metadata.name,
			"status": item.status.phase,
			"startTime": formatDate(new Date(item.status.startTime))
		});
	});
	
	data.countItems = response.length;
		
	return JSON.stringify(data);
}

function formatDate(date) {
	var months = [
	  'January',
	  'February',
	  'March',
	  'April',
	  'May',
	  'June',
	  'July',
	  'August',
	  'September',
	  'October',
	  'November',
	  'December'
	];
	
	var days = [
	  'Sun',
	  'Mon',
	  'Tue',
	  'Wed',
	  'Thu',
	  'Fri',
	  'Sat'
	];
	
	return days[date.getDay()] + ", " 
			+ date.getDate() 
			+ " " 
			+ months[date.getMonth()] 
			+ " " 
			+ date.getFullYear() 
			+ " at " 
			+ date.getUTCHours()
			+ ":"
			+ date.getUTCMinutes()
			+ ":"
			+ date.getUTCSeconds();
}
