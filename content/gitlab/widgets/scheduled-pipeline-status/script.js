/**
 * Below function user variables like WIDGET_CONFIG_GITLAB_URL, WIDGET_CONFIG_GITLAB_TOKEN defined by user at category level.
 *
 * User is supposed to enter the project Id and the scheduled pipeline Id
 *
 */

function run() {
	var data = {};

	data.project = JSON.parse(
		Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT_ID, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN)).name;

	var url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT_ID + "/pipeline_schedules/"+ GITLAB_SCHEDULED_PIPELINE_ID;

	var schedule = JSON.parse(Packages.get(url, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

	if (schedule) {

		data.active = schedule.active;

        var pipeline_id = schedule.last_pipeline == null ? "" : schedule.last_pipeline.id;

        var pipeline_url = WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT_ID + "/pipelines/" + pipeline_id;
        var pipeline = JSON.parse(Packages.get(pipeline_url, "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

		pipeline = Array.isArray(pipeline) ? pipeline[0] : pipeline;

        if (pipeline) {
		    data.status = pipeline.detailed_status == null ? "created": pipeline.detailed_status.group;
		    data.name = schedule.description;
			data.ownerName = schedule.owner.name;
		    data.ownerUserName = schedule.owner.username;
		    data.branch = schedule.ref;
			data.url = pipeline.web_url;
		    data.nextRun = formatDate(schedule.next_run_at);
			 if(data.status !== "created") {
				data.lastRun = formatDate(schedule.last_pipeline.created_at);
			}
			else{
				HIDE_TIMETABLE = true;
				data.hideTimeTable = true;
				SHOW_FAILED_JOBS = false;
			}

			if (HIDE_TIMETABLE && HIDE_TIMETABLE === 'true') {
				data.hideTimeTable = HIDE_TIMETABLE;
			} else {
				if (pipeline.duration) {
					data.duration = secondsToDuration(pipeline.duration);
				} else {
					data.duration = 'N/A';
				}
				if (pipeline.started_at) {
					data.waitingTimeBeforeStarting = secondsToDuration((new Date(pipeline.started_at).getTime() - new Date(pipeline.created_at).getTime()) / 1000);
				} else {
					data.waitingTimeBeforeStarting = secondsToDuration((new Date().getTime() - new Date(pipeline.created_at).getTime()) / 1000) + (' (not started yet)');
				}
			}

			if ((SHOW_FAILED_JOBS && SHOW_FAILED_JOBS === 'true') && (data.status === 'success-with-warnings' || data.status === 'failed')) {
				data.showFailedJobs = SHOW_FAILED_JOBS;
				var failed_jobs = JSON.parse(
					Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + GITLAB_PROJECT_ID + "/pipelines/" + pipeline.id + "/jobs?scope=failed&per_page=100&page=1", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));
					data.failed_jobs = "";
				for (var i = 0; i < failed_jobs.length; i++) {
					data.failed_jobs = data.failed_jobs + failed_jobs[i].name + ", ";
				}
				data.failed_jobs = data.failed_jobs.substring(0, data.failed_jobs.length - 2);
			}

		    if (data.status === 'success') {
			    data.success = true;
		    } else if (data.status === 'success-with-warnings') {
		    	data.warning = true;
	    	} else if (data.status === 'failed') {
		    	data.failed = true;
    		} else if (data.status === 'running') {
	    		data.running = true;
	    	} else if (data.status === 'canceled') {
	    		data.canceled = true;
	    	} else if (data.status === 'skipped') {
	    		data.skipped = true;
	    	} else {
	    		data.otherStatus = true;
	    	}
    	}
    }


	return JSON.stringify(data);
}

function secondsToDuration(duration) {
    var hours = Math.floor(duration / 3600);
    var minutes = Math.floor(duration / 60 ) - (hours * 60);
    var seconds = Math.floor(duration % 60);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + 'h ' + minutes + 'min ' + seconds + 's';
}

function formatDate(date) {
    var hours = new Date(date).getHours() < 10 ? "0" + new Date(date).getHours() : new Date(date).getHours();
    var minutes = new Date(date).getMinutes() < 10 ? "0" + new Date(date).getMinutes() : new Date(date).getMinutes();
    var seconds = new Date(date).getSeconds() < 10 ? "0" + new Date(date).getSeconds() : new Date(date).getSeconds();

	return new Date(date).getFullYear()
			+ "-"
			+ ("0" + (new Date(date).getMonth() + 1)).slice(-2)
			+ "-"
			+ ("0" + new Date(date).getUTCDate()).slice(-2)
			+ " at "
			+ hours
			+ ":"
			+ minutes
			+ ":"
			+ seconds;
}
