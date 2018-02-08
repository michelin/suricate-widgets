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

    var sonarResults = Packages.call("https://sonar.com/sonar/api/measures/component?componentKey="+SURI_PROJECT+"&additionalFields=metrics&metricKeys="+SURI_METRICS, null, null, null);
    if (sonarResults == null) {
        return null;
    }

    data.results = [];

    var jResults = JSON.parse(sonarResults);

    if (Array.isArray(jResults.component.measures)&& Array.isArray(jResults.metrics)){
        for(var i = 0; i< jResults.component.measures.length; i++){
                    var object = {};
                    object.title = jResults.metrics[i].name;
                    object.value = jResults.component.measures[i].value;
                    data.results.push(object);
                }
    }

    return JSON.stringify(data);
}