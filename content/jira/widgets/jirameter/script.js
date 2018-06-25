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
    var data = {};
    var jsonResponseAll = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql="+encodeURIComponent(SURI_JQL_ALL)+"&maxResults=0", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    if (jsonResponseAll == null) {
        return null;
    }
    var jsonResponseClosed = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql="+encodeURIComponent(SURI_JQL_CLOSED)+"&maxResults=0", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    if (jsonResponseClosed == null) {
        return null;
    }

    var jsonObjectClosed = JSON.parse(jsonResponseClosed);
    var jsonObjectAll = JSON.parse(jsonResponseAll);

    data.valueCountSelect = jsonObjectClosed.total;
    data.valueCountAll = jsonObjectAll.total;
    data.value = (jsonObjectClosed.total * 100) / jsonObjectAll.total;
    if (isNaN(data.value)){
        data.value = 0;
    } else {
        data.value = data.value.toFixed(0);
    }

    if (typeof SURI_DISPLAY_COUNT == 'undefined' || SURI_DISPLAY_COUNT == "false"){
        data.displayCount = false
    } else {
        data.displayCount = true;
    }

    return JSON.stringify(data);
}
