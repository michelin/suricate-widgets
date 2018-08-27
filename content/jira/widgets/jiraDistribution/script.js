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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

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

function run (){
    var data = {};
    var baseUrl = WIDGET_CONFIG_JIRA_URL + "/jra/rest/api/2";
    var json = JSON.parse(Packages.call(baseUrl + "/project", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null));
    var res = [];

    json.forEach(function (t) {
        var total = 0;
        if(SURI_ORDERBY === "DAYOFISSUES") {
            total = [];
            var ps = 1000;
            var totalALL = ps;
            var sa = 0;
            while (sa < totalALL) {
                var jsonResponse = JSON.parse(Packages.call(baseUrl + "/search?jql="+encodeURIComponent("project = "+t.key+" AND created >= -"+SURI_WEEK+"w")+"&startAt="+sa+"&maxResults="+ps+"&fields=created", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null));
                sa += ps;
                totalALL = jsonResponse.total;
                if (totalALL > 0 ) {
                    total = total.concat(jsonResponse.issues.map(function (value) { return value.fields.created.substring(0,10) })) ;
                }
            }
            total = total.filter(onlyUnique).length;

        } else if (SURI_ORDERBY === "TIMETOCLOSE") {
            total = [];
            var ps = 1000;
            var totalALL = ps;
            var sa = 0;
            while (sa < totalALL) {
                var jsonResponse = JSON.parse(Packages.call(baseUrl + "/search?jql="+encodeURIComponent("project = "+t.key+" AND status = Closed AND created >= -"+SURI_WEEK+"w")+"&startAt="+sa+"&maxResults="+ps+"&fields=resolutiondate,created,updated", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null));
                sa += ps;
                totalALL = jsonResponse.total;
                if (totalALL > 0 ) {
                    total = total.concat(jsonResponse.issues.map(function (value) {
                        var date1 = new Date(value.fields.created.substring(0,10));
                        var date2;
                        if (value.fields.resolutiondate != null) {
                            date2 = new Date(value.fields.resolutiondate.substring(0,10));
                        }else if (value.fields.updated != null) {
                            date2 = new Date(value.fields.updated.substring(0,10));
                        } else{
                            return 42;
                        }
                        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        return  diffDays
                    })) ;
                }
            }
            if (total.length === 0) {
                total = 0
            } else {
                var sum = total.reduce(function(a, b) { return a + b; });
                total = sum / total.length;
            }
        } else {
            var jsonResponse = JSON.parse(Packages.call(baseUrl + "/search?jql=project = "+t.key+" AND created >= -"+SURI_WEEK+"w&maxResults=1&fields=created", "Authorization", "Basic "+Packages.btoa(WIDGET_CONFIG_JIRA_USER+":"+WIDGET_CONFIG_JIRA_PASSWORD), null));
            total = jsonResponse.total;
        }
        res.push([t.key,total]);
    });

    if (SURI_ORDERBY === "TIMETOCLOSE") {
        res.sort(function (a, b) {
            return a[1] - b[1]
        });
    }else {
        res.sort(function (a, b) {
            return b[1] - a[1]
        });
    }


    data.labels = [];
    data.datapie = [];
    data.colors = [];

    res.forEach(function (t){
        if (t[1] !== 0) {
            data.labels.push(t[0]);
            data.colors.push(stringToColour(t[0]));
            data.datapie.push(t[1]);
        }
    });

    data.border = new Array(data.colors.length);
    data.border.fill("#607D8B");

    data.colors = JSON.stringify(data.colors);
    data.labels = JSON.stringify(data.labels);
    data.datapie = JSON.stringify(data.datapie);
    data.border = JSON.stringify(data.border);

    return JSON.stringify(data);
}

var stringToColour = function (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
};