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

function run (){
    // previous data
    var data = {};
    var jsonResponse = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql="+encodeURIComponent(SURI_JQL)+"&maxResults="+SURI_NUMBER+"&fields=summary,status", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    if (jsonResponse == null) {
        return null;
    }
    var jsonObject = JSON.parse(jsonResponse);

    var array = [];
    for (var i in jsonObject.issues) {
        var ele = {};
        ele.key = jsonObject.issues[i].key;
        ele.summary = jsonObject.issues[i].fields.summary;
        ele.status = jsonObject.issues[i].fields.status.name;
        ele.color = jsonObject.issues[i].fields.status.statusCategory.colorName;
        array.push(ele);
    }

    data.items = array;
    if (typeof SURI_DISPLAY_JIRA_ID == 'undefined' || SURI_DISPLAY_JIRA_ID == "false"){
        data.displayId = false
    } else {
        data.displayId =  true;
    }

    return JSON.stringify(data);
}
