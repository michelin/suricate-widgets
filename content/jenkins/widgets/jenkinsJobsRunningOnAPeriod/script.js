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

var jenkins_host = "https://jenkins.com/jenkins/";
var api_query = "api/json?tree=jobs[name,lastBuild[timestamp]],views[url]";
var data = {};
var bound = new Date();
var bound_timestamp;
var typeToFilter = "";

function run (){
    data.total = 0;
    data.active = 0;
    data.activeTypeToFilter = 0;
    data.allJobs = [];
    data.typeToFilter = "";
    //added to make it more generic
    if (typeof SURI_PERIOD == 'undefined'){
        SURI_PERIOD = "MONTH";
    }
    if (typeof SURI_NB_PERIOD == 'undefined'){
        SURI_NB_PERIOD = 1;
    }

    if (SURI_PERIOD) {
        if (SURI_PERIOD == "DAY") {
            bound.setDate(bound.getDate() - 1*SURI_NB_PERIOD);
        }
        else if (SURI_PERIOD == "WEEK") {
            bound.setDate(bound.getDate() - 7*SURI_NB_PERIOD);
        }
        else if (SURI_PERIOD == "MONTH") {
            bound.setMonth(bound.getMonth() - 1*SURI_NB_PERIOD);
        }
        else if (SURI_PERIOD == "YEAR") {
            bound.setFullYear(bound.getFullYear() - 1*SURI_NB_PERIOD);
        }
    }
    //to manage filter on job type
    bound_timestamp = bound.getTime();
    if (typeof SURI_JOB_TYPE == 'undefined'){
        SURI_JOB_TYPE = "All"
    }
    if (SURI_JOB_TYPE == "Generic") {
        typeToFilter = "GEN"
    }
    var view = "";
    if ( SURI_VIEW != null ){
        view = SURI_VIEW.replace(jenkins_host,"").replace("//","/");
        if (view.indexOf("/") == 0){
            view = view.substring(1,view.length - 1);
        }
        if (view.lastIndexOf("/") != view.length -1 ){
            view = view + "/"
        }
    }
    data.view = view;
    data.viewDisplay = view.replace(new RegExp("view/", 'g'),"").replace(new RegExp("/$", 'g'),"");
    getContent("https://jenkins.com/jenkins/" + view + api_query);
    data.ok = true;
    data.total = data.allJobs.length;
    if (typeToFilter) {
        data.activeToDisplay = data.activeTypeToFilter;
        data.totalToDisplay = data.active;
        data.typeToFilter = SURI_JOB_TYPE;
    }
    else {
        data.activeToDisplay = data.active;
        data.totalToDisplay = data.total
    }
    return JSON.stringify(data);
}

function getContent(url){
    var jsonResponse_jobs = Packages.call(url, null, null, null);
    if (jsonResponse_jobs == null) {
        return null;
    }
    var jsonObject_jobs = JSON.parse(jsonResponse_jobs);
    if(SURI_VIEW != null && jsonObject_jobs.views != undefined){
        for (var i in jsonObject_jobs.views){
            getContent(jsonObject_jobs.views[i].url+api_query);
        }
    }

    for (var j in jsonObject_jobs.jobs){
        //to get right value for data.total for views because if we work with a view some jobs can belong to different sub-views
        if (data.allJobs.indexOf(jsonObject_jobs.jobs[j].name) < 0) {
            data.allJobs.push(jsonObject_jobs.jobs[j].name);
            if (jsonObject_jobs.jobs[j].lastBuild != null && jsonObject_jobs.jobs[j].lastBuild.timestamp > bound_timestamp) {
                data.active++;
                if (typeToFilter && jsonObject_jobs.jobs[j].name.indexOf(typeToFilter) > -1) {
                    data.activeTypeToFilter++;
                }
            }
        }
    }
}