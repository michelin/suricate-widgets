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

	// customfield_10611 is the Green Hopper field for sprint data
	// customfield_10382 contains the story points
	var jsonResponse = Packages.get(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql=" 
						+ encodeURIComponent(SURI_JQL) 
						+ "&fields=customfield_10382,resolutiondate,fixVersions,updated,customfield_10611&maxResults=1000", 
						"Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_JIRA_USER + ":" + WIDGET_CONFIG_JIRA_PASSWORD));
						
	if (jsonResponse == null) {
		return null;
	}

	var issues = JSON.parse(jsonResponse).issues;
	
	// Compute the sprint date from the custom field customfield_10611
	computeSprintDatesFromCustomField10611(data, issues);
	
	if (!data.startDate || !data.endDate) {
		computeSprintDatesFromOtherFields(data, issues);
	}
	
	issues.forEach(function(issue) {
		if (issue.fields.customfield_10382) {
			data.total += issue.fields.customfield_10382;
		} else {
			data.total++;
		}
	});

	for (loopTime = data.startDate; loopTime < data.endDate; loopTime += 86400000) {
		data.labels.push(loopTime);
		data.data.push(data.total);
	}

	// For all issues, check the resolution date. If set, decrease the number of issues to solve in the chronology starting from the
	// resolution date of the current issue
	issues.forEach(function(issue) {
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

/**
Compute the start date and the end date of the sprint from the field 10611
**/
function computeSprintDatesFromCustomField10611(data, issues) {
	var i = 0;
		
	// Try to compute the start and end date from the customfield_10611 field
	while ((!data.startDate || !data.endDate) && i < issues.length) {		
		if (issues[i].fields.customfield_10611 && issues[i].fields.customfield_10611.length === 1) {
			var sprintData = issues[i].fields.customfield_10611[0];
			
			if (sprintData.match("startDate=([0-9-]+)")) {
				var startDate = new Date(sprintData.match("startDate=([0-9-]+)")[1]);
				startDate.setUTCHours(0, 0, 0, 0);
		
				data.startDate = startDate.getTime()
			}
			
			if (sprintData.match("endDate=([0-9-]+)")) {
				var endDate = new Date(sprintData.match("endDate=([0-9-]+)")[1]);
				endDate.setUTCHours(23, 59, 0, 0);
		
				data.endDate = endDate.getTime()
			}
		}
				
		i++;
	}
}

/**
Compute the start date and the end date of the sprint from the resolutionupdate and updated fields
**/
function computeSprintDatesFromOtherFields(data, issues) {
	issues.forEach(function(issue) {
		if (issue.fields.fixVersions[0]) {
			var endDate = new Date(issue.fields.fixVersions[0].releaseDate);
			endDate.setUTCHours(0, 0, 0, 0);
			
			data.endDate = endDate.getTime();
		}
		
		updateStartDate(data, issue.fields.resolutiondate);
		updateStartDate(data, issue.fields.updated);
	});
}

/**
Update the current start date from the given date
**/
function updateStartDate(data, date) {
	if (date) {
		var startDate = new Date(date);
		startDate.setUTCHours(0, 0, 0, 0);
    
		if (data.startDate === undefined || data.startDate > startDate.getTime()) {
			data.startDate = startDate.getTime();
		}
	}
}