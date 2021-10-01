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

Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}

function run() {
  
  var data = {};

  var token = Packages.btoa(WIDGET_CONFIG_JIRA_USER + ":" + WIDGET_CONFIG_JIRA_PASSWORD)
  var authorizationHeaderValue = "Basic " + token;
  var jql = "project = " + SURI_JIRA_PROJECT + " AND statusCategory = Done AND created > startOfDay(-" + SURI_JIRA_START_RANGE + "d)";

  var startAt = 0;
  var totalIssues = 0;
  var jiraIssues = [];

  do {

    var query = "?jql=" + encodeURIComponent(jql) + "&startAt=" + startAt + "&maxResults=1000";

    var result = JSON.parse(Packages.get(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search" + query, "Authorization", authorizationHeaderValue));
    
    totalIssues = result.total;

    data.result = result;

    for(var issueIndex in result.issues) {
      var createdAt = new Date(result.issues[issueIndex].fields.created);
      var resolvedAt = new Date(result.issues[issueIndex].fields.resolutiondate);

      var localLeadTime = resolvedAt.getTime() - createdAt.getTime();

      jiraIssues.push({
        key: result.issues[issueIndex].key,
        createdAt : createdAt,
        resolvedAt: resolvedAt,
        localLeadTime: localLeadTime
      });
    }

    startAt+= 1000

  } while(jiraIssues.length < totalIssues)

  var leadTime = 0;

  for(var issueIndex in jiraIssues) {
    leadTime = leadTime + jiraIssues[issueIndex].localLeadTime;
  }

  leadTime = leadTime / jiraIssues.length;

  data.tt = leadTime;

  data.jql = jql;

  data.issuesUrl = WIDGET_CONFIG_JIRA_URL + "/jra/issues/?jql=" + jql;

  data.issuesCount = jiraIssues.length;

  var now = new Date();
  var dateForDaysAgo = new Date(new Date().setDate(new Date().getDate() - SURI_JIRA_START_RANGE));

  data.startRange = dateForDaysAgo.toJSON().slice(0, 10);
  data.endRange = now.toJSON().slice(0, 10);

  if (SURI_JIRA_VALUE_FORMAT === 'HOURS') {
    data.inHours = true;
    data.leadTime = (leadTime / (1000 * 60 * 60 )).round(2);
  }
  else if(SURI_JIRA_VALUE_FORMAT === 'MINUTES') {
    data.inMinutes = true;
    data.leadTime = (leadTime / (1000 * 60 )).round(2);
  }
  else if(SURI_JIRA_VALUE_FORMAT === 'SECONDS') {
    data.inSeconds = true;
    data.leadTime = (leadTime / 1000).round(2);
  }
  else {
    data.inDays = true;
    data.leadTime = (leadTime / (1000 * 60 * 60 * 24)).round(2);
  }

  return JSON.stringify(data);
}