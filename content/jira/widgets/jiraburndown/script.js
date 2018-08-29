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

if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
        value: function(value) {

            // Steps 1-2.
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }

            var O = Object(this);

            // Steps 3-5.
            var len = O.length >>> 0;

            // Steps 6-7.
            var start = arguments[1];
            var relativeStart = start >> 0;

            // Step 8.
            var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);

            // Steps 9-10.
            var end = arguments[2];
            var relativeEnd = end === undefined ? len : end >> 0;

            // Step 11.
            var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

            // Step 12.
            while (k < final) {
                O[k] = value;
                k++;
            }

            // Step 13.
            return O;
        }
    });
}

function updateStartDate(data, date){
    if (date !== null) {
        var startdate = new Date(date);
        startdate.setUTCHours(0,0,0,0);
        if (data.startDate === undefined || data.startDate > startdate.getTime()) {
            data.startDate = startdate.getTime()
        }
    }
}

function updateSprintDate(data, fieldData){
    var startdate = new Date(fieldData.match("startDate=([0-9-]+)")[1]);
    startdate.setUTCHours(0,0,0,0);
    var releaseDate = new Date(fieldData.match("endDate=([0-9-]+)")[1]);
    releaseDate.setUTCHours(0,0,0,0);
    data.releaseDate = releaseDate.getTime()
    data.startDate = startdate.getTime()
}

function run (){
    // customfield_10611 -> greenhopper field for sprint data
    // customfield_10382 -> Story point
    var jsonResponse = Packages.call(WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2/search?jql="+encodeURIComponent(SURI_JQL)+"&fields=customfield_10382,resolutiondate,fixVersions,updated,customfield_10611", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null);
    if (jsonResponse == null) {
        return null;
    }
    var jsonObject = JSON.parse(jsonResponse);

    var data = {};
    data.total = 0;
    for (var i in jsonObject.issues){
        // Update start date
        if (jsonObject.issues[i].fields.customfield_10611 === undefined){
            if (data.releaseDate === undefined) {
                var release = new Date(jsonObject.issues[i].fields.fixVersions[0].releaseDate);
                release.setUTCHours(0,0,0,0);
                data.releaseDate = release.getTime();
            }
            updateStartDate(data,jsonObject.issues[i].fields.resolutiondate);
            updateStartDate(data,jsonObject.issues[i].fields.updated);
        } else {
            updateSprintDate(data,jsonObject.issues[i].fields.customfield_10611[0]);
        }

        if (jsonObject.issues[i].fields.customfield_10382 !== undefined){
            data.total += jsonObject.issues[i].fields.customfield_10382;
        } else {
            data.total ++;
        }
    }

    // Create list label
    var arrayLabel = [];
    for(loopTime = data.startDate; loopTime < data.releaseDate; loopTime += 86400000) {
        arrayLabel.push(loopTime);
    }
    data.labels = arrayLabel;

    // Init array
    data.data = new Array(arrayLabel.length);
    data.data.fill(data.total);

    // calculate issue point value
    for (var i in jsonObject.issues){
        if (jsonObject.issues[i].fields.resolutiondate != null){
            var dec = 1
            if (jsonObject.issues[i].fields.customfield_10382 !== undefined && jsonObject.issues[i].fields.customfield_10382 !== 0){
                dec = jsonObject.issues[i].fields.customfield_10382;
            }
            var resolutionDate = new Date(jsonObject.issues[i].fields.resolutiondate);
            resolutionDate.setUTCHours(0,0,0,0);
            for (var i = (resolutionDate.getTime() - data.startDate)/86400000; i < data.data.length; i++) {
                data.data[i] -= dec;
            }
        }
    }

    // Set to 0 all new date
    for (var i in data.data){
        if (new Date().getTime() < data.labels[i]){
            data.data[i] = 0;
        }
    }


    return JSON.stringify(data);
}