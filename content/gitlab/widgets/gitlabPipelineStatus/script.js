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

function run (){
    // previous data
    var data = JSON.parse(SURI_PREVIOUS);
    if (data == null) {
        data = {};
    }

    var raw = Packages.call(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN, null);
    data.projectName = JSON.parse(raw).name_with_namespace;
    data.branchName = GITLAB_BRANCH;

    raw = Packages.call(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT + "/pipelines", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN, null);
    var rawData = JSON.parse(raw);

    var status;

    for (var i in rawData) {
        if (rawData[i].ref == GITLAB_BRANCH) {
            print(rawData[i].ref);
            print(rawData[i].status);
            data.success = rawData[i].status === "success";
            data.failure = rawData[i].status === "failed";

            // Add complementary elements in case of failure
            if (data.failure) {
                raw = Packages.call(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT + "/pipelines/" + rawData[i].id, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN, null);
                rawData = JSON.parse(raw);
                data.author = rawData.user.name;
            }
            break;
        }

    }

    return JSON.stringify(data);
}