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
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

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

var data = {};

function run() {

  var pagesize = 500;

  var url = WIDGET_CONFIG_SONAR_URL + "/sonar/api/components/search?qualifiers=TRK&ps=" + pagesize;
  var lastactiv = new Date();
  lastactiv.setMonth(lastactiv.getMonth() - SURI_MONTH);
  lastactiv = lastactiv.getUTCFullYear() + "-" + (lastactiv.getUTCMonth() + 1) + "-" + lastactiv.getUTCDate();

  var json = JSON.parse(Packages.call(url, null, null, null));
  arr = {};
  var p = 1;
  json.components.forEach(function(x) {
    var tri = x.name.substring(0, 3);
    if (SURI_ORDER_BY == "DAYOFANALYSE") {
      if (arr[tri]) {
        arr[tri].push(parseProject(x.key, lastactiv));
      } else {
        arr[tri] = parseProject(x.key, lastactiv);
      }
    } else {
      if (arr[tri]) {
        arr[tri] += parseProject(x.key, lastactiv);
      } else {
        arr[tri] = parseProject(x.key, lastactiv);
      }
    }
  });

  while (json.paging.total > pagesize * p) {
    json = JSON.parse(Packages.call(url + "&p=" + (++p), null, null, null));
    json.components.forEach(function(x) {
      var tri = x.name.substring(0, 3);
      if (SURI_ORDER_BY == "DAYOFANALYSE") {
        if (arr[tri]) {
          arr[tri].push(parseProject(x.key, lastactiv));
        } else {
          arr[tri] = parseProject(x.key, lastactiv);
        }
      } else {
        if (arr[tri]) {
          arr[tri] += parseProject(x.key, lastactiv);
        } else {
          arr[tri] = parseProject(x.key, lastactiv);
        }
      }
    });
  }

  if (SURI_ORDER_BY == "DAYOFANALYSE") {
    Object.keys(arr).forEach(function(x) {
      arr[x] = arr[x].filter(onlyUnique).length
    });
  }

  ar = [];
  Object.keys(arr).forEach(function(x) {
    if (arr[x] > 0) {
      ar.push([x, arr[x]])
    }
  });
  arr = ar;

  arr.sort(function(a, b) {
    return b[1] - a[1];
  });

  data.labels = [];
  data.datapie = [];
  data.colors = [];

  arr.forEach(function(t) {
    data.labels.push(t[0]);
    data.colors.push(stringToColour(t[0]));
    data.datapie.push(t[1]);
  });

  data.border = new Array(data.colors.length);
  data.border.fill("#607D8B");

  data.colors = JSON.stringify(data.colors);
  data.labels = JSON.stringify(data.labels);
  data.datapie = JSON.stringify(data.datapie);
  data.border = JSON.stringify(data.border);


  return JSON.stringify(data);
}

function parseProject(key, lastactiv) {
  var pagesize = 1;
  var p = 1;
  if (SURI_ORDER_BY == "DAYOFANALYSE") {
    pagesize = 500;
  }
  var projectURL = WIDGET_CONFIG_SONAR_URL + "/sonar/api/project_analyses/search?project=" + key + "&from=" + lastactiv + "&ps" + pagesize;
  var jsonProject = JSON.parse(Packages.call(projectURL, null, null, null));
  var ct = 0;
  if (SURI_ORDER_BY == "DAYOFANALYSE") {
    ar = [];
    ar = ar.concat(jsonProject.analyses.map(function(value) {
      return value.date.substring(0, 10)
    }));
    while (jsonProject.paging.total > pagesize * p) {
      jsonProject = JSON.parse(Packages.call(projectURL + "&p=" + (++p), null, null, null));
      ar = ar.concat(jsonProject.analyses.map(function(value) {
        return value.date.substring(0, 10)
      }));
    }
    ct = ar;
  } else {
    ct = jsonProject.paging.total;
  }
  return ct;
}

var stringToColour = function(str) {
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