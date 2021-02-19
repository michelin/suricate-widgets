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

function run() {
    var data = {};

    var url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/runners?tag_list=" + SURI_RUNNER_TAG;

    var runners = JSON.parse(Packages.get(url, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

    var responses = [];
    runners.forEach(function (item) {
        var response = {};
        response.description = item.description;
        if (item.description.length > 23) {
            response.description = item.description.substring(0, 23) + "...";
        }
        if (item.status === 'online') {
            response.online = true;
        } else if (item.status === 'paused') {
            response.paused = true;
        } else {
            response.offline = true;
        }
        responses.push(response);
    });
    if (responses && responses.length > 0) {
        data.items = responses;
    }

    return JSON.stringify(data);
}
