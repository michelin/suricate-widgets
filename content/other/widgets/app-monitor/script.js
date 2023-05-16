/*
  * Copyright 2012-2021 the original author or authors.
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

    var statusCode = Packages.get(SURI_URL, true);

    if (SURI_HTTP_CODES.contains(statusCode)) {
        data.status = 'OK';
        data.ok = true;
    } else {
        data.status = 'KO';
        data.ok = false;
    }
    data.code = statusCode;

	return JSON.stringify(data);
}
