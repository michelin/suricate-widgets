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

function getExecution(obj,parent){
    var ret = {};
    ret.percent = (obj.count * 100) / parent.totalExecutions;
    ret.statusKey = obj.statusKey;
    ret.statusColor = obj.statusColor;
    return ret;
}

function sort(a, b){
    if (a.statusKey === -1)
        return 1;
    if (b.statusKey === -1)
        return -1;
    return a.statusKey - b.statusKey;
}

function run (){
    var data = {};
    var jsonResponse = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/zephyr/1.0/util/project-list", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    if (jsonResponse == null) {
        return null;
    }
    var jsonObject = JSON.parse(jsonResponse);

    // Extract project id with it's name
    var projectId = null;
    for (var i = 0; i < jsonObject.options.length; i++){
        if (jsonObject.options[i].label.indexOf(SURI_PROJECT) !== -1){
            projectId = jsonObject.options[i].value;
        }
    }

    if (projectId === null){
        Packages.throwFatalError("Project not found for name: " + SURI_PROJECT)
    }

    // Find version id
    jsonResponse = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/zephyr/1.0/util/versionBoard-list?projectId="+projectId, "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    jsonObject = JSON.parse(jsonResponse);

    var versionArray = [];
    var versionId = null;
    versionArray = versionArray.concat(jsonObject.unreleasedVersions);
    versionArray = versionArray.concat(jsonObject.releasedVersions);

    for (i = 0; i < versionArray.length; i++){
        if (versionArray[i].label.indexOf(SURI_VERSION) === 0){
            versionId = versionArray[i].value;
        }
    }

    if (versionId === null){
        Packages.throwFatalError("Version '"+SURI_VERSION+"' not found in project: " + SURI_PROJECT)
    }

    // Get cycle
    jsonResponse = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/zephyr/1.0/cycle/?projectId="+projectId+"&versionId="+versionId+"&expand=executionSummaries", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    jsonObject = JSON.parse(jsonResponse);

    var regex = null;
    if (SURI_REGEX !== null){
        regex = "^"+SURI_REGEX+"$";
    } else {
        regex = ".*";
    }
    var array = [];
    for (var key in jsonObject) {
        var obj = {};
        if (jsonObject[key].name !== undefined && jsonObject[key].name.match(regex)) {
            obj.name = jsonObject[key].name;
            obj.executions = [];
            for (i = 0;  i < jsonObject[key].executionSummaries.executionSummary.length; i++){
                if (jsonObject[key].executionSummaries.executionSummary[i].count !== 0) {
                    obj.executions.push(getExecution(jsonObject[key].executionSummaries.executionSummary[i],jsonObject[key]));
                }
            }
            obj.executionEmpty = obj.executions.length === 0;
            obj.executions.sort(sort);

            obj.percent = "";
            if (SURI_DISPLAY_PERCENT_EXEC === "YES"){
                if (jsonObject[key].totalExecutions > 0) {
                	obj.percent = " - " + Math.round(1000 * jsonObject[key].totalExecuted / jsonObject[key].totalExecutions) / 10 + "%";
                } else {
                    obj.percent = " - " + "0%";
                }
            }
            
            
            array.push(obj);
        }
    }
    data.items = array;

    return JSON.stringify(data);
}