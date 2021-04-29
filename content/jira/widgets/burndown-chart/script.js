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
	data.total = 0;
	data.data = [];
	data.labels = [];

	// customfield_10611 -> Greenhopper field for sprint data
	// customfield_10382 -> Story point
	var jsonResponse = Packages.get(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql=" + encodeURIComponent(SURI_JQL) + "&fields=customfield_10382,resolutiondate,fixVersions,updated,customfield_10611", "Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_JIRA_USER + ":" + WIDGET_CONFIG_JIRA_PASSWORD));
	if (jsonResponse == null) {
		return null;
	}

	var jsonObject = JSON.parse(jsonResponse);

	jsonObject.issues.forEach(function(issue) {
		if (issue.fields.customfield_10611) {
			updateSprintDate(data, issue.fields.customfield_10611[0]);
		} else {
			if (!data.releaseDate && issue.fields.fixVersions[0]) {
				var release = new Date(issue.fields.fixVersions[0].releaseDate);
				release.setUTCHours(0, 0, 0, 0);
				data.releaseDate = release.getTime();
			}
		  
			updateStartDate(data, issue.fields.resolutiondate);
			updateStartDate(data, issue.fields.updated);
		}

		if (issue.fields.customfield_10382) {
			data.total += issue.fields.customfield_10382;
		} else {
			data.total++;
		}
	});

	for (loopTime = data.startDate; loopTime < data.releaseDate; loopTime += 86400000) {
		data.labels.push(loopTime);
		data.data.push(data.total);
	}

	// For all issues, check the resolution date. If set, decrease the number of issues to solve in the chronology starting from the
	// resolution date of the current issue
	jsonObject.issues.forEach(function(issue) {
		if (issue.fields.resolutiondate) {
		  var dec = 1
		  if (issue.fields.customfield_10382 && issue.fields.customfield_10382 !== 0) {
			dec = issue.fields.customfield_10382;
		  }
		  
		  var resolutionDate = new Date(issue.fields.resolutiondate);
		  resolutionDate.setUTCHours(0, 0, 0, 0);
		  
		  for (var i = (resolutionDate.getTime() - data.startDate) / 86400000; i < data.data.length; i++) {
			data.data[i] -= dec;
		  }
		}
	});
	
	for (var i in data.data) {
		if (new Date().getTime() < data.labels[i]) {
		  data.data[i] = 0;
		}
	}

	data.labels = JSON.stringify(data.labels);
	data.data = JSON.stringify(data.data);
	
	return JSON.stringify(data);
}

function updateSprintDate(data, fieldData) {
	if (fieldData.match("startDate=([0-9-]+)")) {
		var startdate = new Date(fieldData.match("startDate=([0-9-]+)")[1]);
		startdate.setUTCHours(0, 0, 0, 0);
		
		data.startDate = startdate.getTime()
	}
	
	if (fieldData.match("endDate=([0-9-]+)")) {
		var releaseDate = new Date(fieldData.match("endDate=([0-9-]+)")[1]);
		releaseDate.setUTCHours(0, 0, 0, 0);
		
		data.releaseDate = releaseDate.getTime()
	}
}

function updateStartDate(data, date) {
  if (date) {
    var startdate = new Date(date);
    startdate.setUTCHours(0, 0, 0, 0);
    if (data.startDate === undefined || data.startDate > startdate.getTime()) {
      data.startDate = startdate.getTime()
    }
  }
}