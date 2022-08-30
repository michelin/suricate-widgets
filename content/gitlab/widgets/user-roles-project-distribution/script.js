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
	var page = 1;
	data.minimalAccess = 0;
	data.guest = 0;
	data.reporter = 0;
	data.developer = 0;
	data.maintainer = 0;
	data.owner = 0;
	data.total = 0;

	var project = JSON.parse(Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
	var members = JSON.parse(Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/members/all?per_page=100&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

	if (members && members.length > 0) {
		data.minimalAccess = countMembersOfRole(members, 5);
		data.guest = countMembersOfRole(members, 10);
		data.reporter = countMembersOfRole(members, 20);
		data.developer = countMembersOfRole(members, 30);
		data.maintainer = countMembersOfRole(members, 40);
		data.owner = countMembersOfRole(members, 50);
		data.total = members.length;
	}

	while (members && members !== null && members.length > 0) {
		page++;

		members = JSON.parse(Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/members/all?per_page=100&page=" + page, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		if (members && members.length > 0) {
			data.minimalAccess = data.minimalAccess + countMembersOfRole(members, 5);
			data.guest = data.guest + countMembersOfRole(members, 10);
			data.reporter = data.reporter + countMembersOfRole(members, 20);
			data.developer = data.developer + countMembersOfRole(members, 30);
			data.maintainer = data.maintainer + countMembersOfRole(members, 40);
			data.owner = data.owner + countMembersOfRole(members, 50);
			data.total = data.total + members.length;
		}
	}

	data.projectName = project.name;

	return JSON.stringify(data);
}

function countMembersOfRole(members, role) {
	return members.filter(function(member) {
		if (member.access_level === role) {
			return member;
		}
	}).length;
}
