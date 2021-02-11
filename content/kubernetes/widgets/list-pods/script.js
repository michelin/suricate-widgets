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
	var data = {};
	
	var pods = JSON.parse(
		Packages.get(WIDGET_CONFIG_KUBERNETES_API_SERVER + "/api/v1/namespaces/" + SURI_NAMESPACE + "/pods?limit=500", 
					 "Authorization", 
					 "Bearer " + SURI_SERVICE_ACCOUNT_TOKEN));
	
	if (SURI_STATUS && SURI_STATUS != 'All') {
		pods.items = pods.items.filter(function(pod) {
			if (pod.status.phase === SURI_STATUS) {
				return pod;
			}
		});
	}
	
	if (SURI_PODS_NAME) {
		pods.items = pods.items.filter(function(pod) {
			if (pod.metadata.name.indexOf(SURI_PODS_NAME) > -1) {
				return pod;
			}
		});
	}
	
	if (SURI_ORDER_BY) {
		if (SURI_ORDER_BY === 'START_DATE_ASC') {
			pods.items.sort(orderByStartedDateAsc);
		} else {
			pods.items.sort(orderByStartedDateDesc);
		}
	}
	
	if (SURI_TOP) {
		pods.items = pods.items.slice(0, SURI_TOP);
	}
	
	var response = [];
	pods.items.forEach(function(item) {
		response.push({
			"name": item.metadata.name,
			"status": item.status.phase,
			"startTime": formatDate(new Date(item.status.startTime))
		});
	});
	
	if (response.length > 0) {
		data.items = response;
	}
		
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

function orderByStartedDateAsc(a, b) {
  if (new Date(a.status.startTime) < new Date(b.status.startTime)) {
    return -1;
  }
  
  if (new Date(a.status.startTime) > new Date(b.status.startTime)) {
    return 1;
  }
  
  return 0;
}

function orderByStartedDateDesc(a, b) {
  if (new Date(a.status.startTime) > new Date(b.status.startTime)) {
    return -1;
  }
  
  if (new Date(a.status.startTime) < new Date(b.status.startTime)) {
    return 1;
  }
  
  return 0;
}