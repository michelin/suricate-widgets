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

	var url = CATEGORY_SURICATE_URL + "/api/v1/screens/count";
	
	data.numberOfConnectedScreens = Packages.get(url, "Authorization", "Token " + CATEGORY_SURICATE_TOKEN);

	if (SURI_PREVIOUS && JSON.parse(SURI_PREVIOUS).numberOfConnectedScreens) {
		data.evolution = ((data.numberOfConnectedScreens - JSON.parse(SURI_PREVIOUS).numberOfConnectedScreens) * 100 / JSON.parse(SURI_PREVIOUS).numberOfConnectedScreens).toFixed(1);
		data.arrow = data.evolution == 0 ? '' : (data.evolution > 0 ? "up" : "down");
	}
	
	return JSON.stringify(data);
}
