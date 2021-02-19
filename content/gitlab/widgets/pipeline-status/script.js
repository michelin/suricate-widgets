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

    data.project = JSON.parse(
        Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN)).name;

    var url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/pipelines?per_page=100&page=1";

    if (SURI_PROJECT_BRANCH) {
        url += "&ref=" + SURI_PROJECT_BRANCH;
    }

    var pipelines = JSON.parse(Packages.get(url, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

    if (pipelines && pipelines.length > 0) {
        var pipeline = JSON.parse(
            Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/pipelines/" + pipelines[0].id, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

        data.status = pipeline.status;
        data.branch = pipeline['ref'];
        data.name = pipeline.user.name;
        data.username = pipeline.user.username;

        if (data.status === 'success') {
            data.success = true;
        } else if (data.status === 'failed') {
            data.failed = true;
        } else if (data.status === 'running') {
            data.running = true;
        } else {
            data.otherStatus = true;
        }

        if (pipeline.duration !== null) {
            data.duration = formattedDuration(pipeline.duration);
        }

        if (pipeline.status !== 'canceled') {
            var waitingTime = pipeline['started_at'] !== null ? new Date(pipeline['started_at']) - new Date(pipeline['created_at'])
                : new Date.now() - new Date(pipeline['created_at']);
            data.waitDuration = formattedDuration(Math.abs(waitingTime / 1000));
        }

        data.createDate = formattedDate(new Date(pipeline['created_at']));
    }

    return JSON.stringify(data);
}

function formattedDuration(duration) {
    var hours = Math.floor(duration / 60 / 60);
    var minutes = Math.floor(duration / 60 ) - (hours * 60);
    var seconds = Math.floor(duration % 60);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ':' + minutes + ':' + seconds;
}

function formattedDate(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return year + '/' + ((month < 10) ? '0' + month : month) + '/' + ((day < 10) ? '0' + day : day);
}
