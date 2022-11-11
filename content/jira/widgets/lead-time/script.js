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

  var issuesTypes = [];

  var token = Packages.btoa(WIDGET_CONFIG_JIRA_USER + ":" + WIDGET_CONFIG_JIRA_PASSWORD)
  var authorizationHeaderValue = "Basic " + token;

  // Build jql query
  var jql = "project = " + SURI_JIRA_PROJECT + " AND statusCategory = Done AND created > startOfDay(-" + SURI_JIRA_START_RANGE + "d)";

  if (WIDGET_CONFIG_JIRA_TYPES) {
    // Add issues types to jql query
    
    issuesTypes = WIDGET_CONFIG_JIRA_TYPES.split(",");
    var formatedIssuesTypes = [];

    for (var issueTypeIndex in issuesTypes) {
      formatedIssuesTypes.push("'" + issuesTypes[issueTypeIndex] + "'");
    }

    jql = jql + " AND type in (" + formatedIssuesTypes.join() + ")";
  }

  if (WIDGET_CONFIG_JIRA_INITIAL_STATUS) {
    jql = jql + " AND status was '" + WIDGET_CONFIG_JIRA_INITIAL_STATUS + "'";
  }

  if (WIDGET_CONFIG_JIRA_FINAL_STATUS) {
    jql = jql + " AND status was '" + WIDGET_CONFIG_JIRA_FINAL_STATUS + "'";
  }

  var startAt = 0;
  var totalIssues = 0;
  var jiraIssues = [];

  do {

    var query = "?jql=" + encodeURIComponent(jql) + "&startAt=" + startAt + "&maxResults=1000&expand=changelog";

    var result = JSON.parse(Packages.get(WIDGET_CONFIG_JIRA_URL + "/rest/api/2/search" + query, "Authorization", authorizationHeaderValue));

    startAt+= 1000;
    
    totalIssues = result.total;

    data.result = result;

    for(var issueIndex in result.issues) {

      var issue = result.issues[issueIndex];
      var startedAt = null;
      var endAt = null;

      if(WIDGET_CONFIG_JIRA_INITIAL_STATUS) {
        // Get datetime of first transition wher target status is equal to WIDGET_CONFIG_JIRA_INITIAL_STATUS
        startedAt = getStartDateByStatus(issue);
      }
      else {
        // Else, use creation date
        startedAt = new Date(issue.fields.created);
      }

      if(WIDGET_CONFIG_JIRA_FINAL_STATUS) {
        // Get datetime of latest transition when target status is equal to WIDGET_CONFIG_JIRA_FINAL_STATUS
        endAt = getEndDateByStatus(issue);
      }
      else {
        // Else, use resolution date
        endAt = new Date(issue.fields.resolutiondate);
      }

      var localLeadTime = endAt.getTime() - startedAt.getTime();

      jiraIssues.push({
        key: issue.key,
        startedAt : startedAt,
        resolvedAt: endAt,
        localLeadTime: localLeadTime
      });
    }
  } while(jiraIssues.length < totalIssues)

  var leadTime = 0;
  var minLeadTime = Number.MAX_VALUE;
  var maxLeadTime = 0;

  for(var issueIndex in jiraIssues) {
    leadTime = leadTime + jiraIssues[issueIndex].localLeadTime;

    if(jiraIssues[issueIndex].localLeadTime < minLeadTime) {
      minLeadTime = jiraIssues[issueIndex].localLeadTime;
    }
    
    if(jiraIssues[issueIndex].localLeadTime > maxLeadTime) {
      maxLeadTime = jiraIssues[issueIndex].localLeadTime;
    }
  }

  leadTime = leadTime / jiraIssues.length;

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
    data.minLeadTime = (minLeadTime / (1000 * 60 * 60 )).round(2);
    data.maxLeadTime = (maxLeadTime / (1000 * 60 * 60 )).round(2);
  }
  else if(SURI_JIRA_VALUE_FORMAT === 'MINUTES') {
    data.inMinutes = true;
    data.leadTime = (leadTime / (1000 * 60 )).round(2);
    data.minLeadTime = (minLeadTime / (1000 * 60 )).round(2);
    data.maxLeadTime = (maxLeadTime / (1000 * 60 )).round(2);
  }
  else if(SURI_JIRA_VALUE_FORMAT === 'SECONDS') {
    data.inSeconds = true;
    data.leadTime = (leadTime / 1000).round(2);
    data.minLeadTime = (minLeadTime / 1000).round(2);
    data.maxLeadTime = (maxLeadTime / 1000).round(2);
  }
  else {
    data.inDays = true;
    data.leadTime = (leadTime / (1000 * 60 * 60 * 24)).round(2);
    data.minLeadTime = (minLeadTime / (1000 * 60 * 60 * 24)).round(2);
    data.maxLeadTime = (maxLeadTime / (1000 * 60 * 60 * 24)).round(2);
  }

  // Process issues status
  if (WIDGET_CONFIG_JIRA_INITIAL_STATUS) {
    data.startStatus = WIDGET_CONFIG_JIRA_INITIAL_STATUS;
  }
  else {
    data.startStatus = "Created";
  }

  if (WIDGET_CONFIG_JIRA_FINAL_STATUS) {
    data.endStatus = WIDGET_CONFIG_JIRA_FINAL_STATUS;
  }
  else {
    data.endStatus = "Resolved";
  }

  // Process issues types
  data.issuesTypes = issuesTypes.join(", ");

  if (issuesTypes.length > 0) {
    data.showIssuesTypes = true;
  }
  else {
    data.showIssuesTypes = false;
  }
  

  return JSON.stringify(data);
}

function getStartDateByStatus(jiraIssue) {

  for(var historyIndex in jiraIssue.changelog.histories) {
    var history = jiraIssue.changelog.histories[historyIndex];
    for(var itemIndex in history.items) {
      var item = history.items[itemIndex];
      if(item.field === "status" && item.toString === WIDGET_CONFIG_JIRA_INITIAL_STATUS) {
        return new Date(history.created);
      }
    }
  }
  return null;
}

function getEndDateByStatus(jiraIssue) {

  for(var historyIndex in jiraIssue.changelog.histories.reverse()) {
    var history = jiraIssue.changelog.histories[historyIndex];
    for(var itemIndex in history.items) {
      var item = history.items[itemIndex];
      if(item.field === "status" && item.toString === WIDGET_CONFIG_JIRA_FINAL_STATUS) {
        return new Date(history.created);
      }
    }
  }
  return null;
}