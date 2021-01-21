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
  
var nbJob = 0;
var nbFailed = 0;
var nbUnstable = 0;

var data = {};

function run() {
	var jobs = [];
	jobs = SURI_JOB_LIST.split(",");

	nbJob = jobs.length;

	data.job_critical = [];
	data.job_unstable = [];

	for (var i = 0; i < jobs.length; i++) {
		var jsonResponse = Packages.get(WIDGET_CONFIG_JENKINS_URL + "/jenkins/job/" + jobs[i] + "/lastBuild/api/json");
		if (jsonResponse === null) {
			return null;
		}
		var jsonObject = JSON.parse(jsonResponse);
		if (jsonObject.error !== undefined || jsonObject.errors !== undefined) {
			Packages.throwFatalError("Job not found in Jenkins:\n\n" + jsonResponse)
		}
		if (jsonObject.hasOwnProperty("result")) {
			if (jsonObject.result === "FAILURE") {
				nbFailed++;
				data.job_critical = data.job_critical.concat(extractJobData(jsonObject, jobs[i]));
			} else if (jsonObject.result === "UNSTABLE") {
				nbUnstable++;
				data.job_unstable = data.job_unstable.concat(extractJobData(jsonObject, jobs[i]));
			}
		}
	}

	data.ok = nbFailed + nbUnstable === 0;
	data.warning = nbUnstable !== 0;
	data.critic = nbFailed !== 0;

	if (data.ok) {
		data.status = "green";
	} else if (data.critic) {
		data.status = "red";
	} else if (data.warning) {
		data.status = "yellow";
	}

	data.nbJob = nbJob;
	data.nbFailed = nbFailed;
	data.nbUnstable = nbUnstable;

	data.small = (data.nbFailed + data.nbUnstable) > 3;
	data.minimal = (data.nbFailed + data.nbUnstable) > 10;

	return JSON.stringify(data);
}

/**
 * Method used to extract job data
 * @param job's jsonObject, job name
 * @returns object containing data
 */
function extractJobData(jsonObject, job) {
	var val = {};
	for (var j in jsonObject.actions) {
		if (jsonObject.actions[j].hasOwnProperty("causes")) {
			for (var k in jsonObject.actions[j].causes) {
				if (jsonObject.actions[j].causes[k].hasOwnProperty("shortDescription")) {
					if (jsonObject.actions[j].causes[k].hasOwnProperty("userId")) {
						val.builder = jsonObject.actions[j].causes[k].userId;
					} else if (jsonObject.actions[j].causes[k].hasOwnProperty("userName")) {
						val.builder = jsonObject.actions[j].causes[k].userName;
					} else if (jsonObject.actions[j].causes[k].hasOwnProperty("upstreamProject") && val.builder === undefined) {
						//if val.builder is already defined, do not overwrite w/ upstream
						val.builder = 'upstream ' + jsonObject.actions[j].causes[k].upstreamProject;
					} else if (jsonObject.actions[j].causes[k].hasOwnProperty("addr")) {
						val.builder = 'remote ' + jsonObject.actions[j].causes[k].addr;
					} else if (val.builder === undefined) {
						var myString = jsonObject.actions[j].causes[k].shortDescription;
						var myRegexp = /(timer|alarme)/g;
						var match = myRegexp.exec(myString);

						if (match !== null) {
							val.builder = match[0];
						} else {
							val.builder = "N/A";
						}
					}
				}
			}
		}
	}
	if (val.builder === null) {
		val.builder = "N/A";
	}
	val.jobStatus = jsonObject.result;
	val.jobName = job;
	return val;
}