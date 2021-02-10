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
	var index = 0;
	var images = [];
	
	images.push(SURI_IMG);
	
	if (SURI_IMG_2) {
		images.push(SURI_IMG_2);
	}
	
	if (SURI_IMG_3) {
		images.push(SURI_IMG_3);
	}
	
	if (SURI_IMG_4) {
		images.push(SURI_IMG_4);
	}
	
	if (SURI_IMG_5) {
		images.push(SURI_IMG_5);
	}
	
	if (SURI_PREVIOUS) {
		if (images.indexOf(JSON.parse(SURI_PREVIOUS).img) > -1) {
			index = images.indexOf(JSON.parse(SURI_PREVIOUS).img) + 1;
			
			if (index >= images.length) {
				index = 0;
			}
		} else {
			index = 0;
		}
	}
	
	data.img = images[index];
	
	return JSON.stringify(data);
}