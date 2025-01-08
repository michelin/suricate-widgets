function run() {
	var data = {};
	var projectID = WIDGET_PROJECT_ID_OR_PATH.replaceAll("/", "%2F");
	
	data.project = JSON.parse(
		Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN)).name;

	var url = CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID + "/pipeline_schedules/"+ WIDGET_SCHEDULED_PIPELINE_ID;

	var schedule = JSON.parse(Packages.get(url, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

	if (schedule) {
		data.active = schedule.active;

        var pipeline_id = schedule.last_pipeline == null ? "" : schedule.last_pipeline.id;

        var pipeline_url = CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID + "/pipelines/" + pipeline_id;
        var pipeline = JSON.parse(Packages.get(pipeline_url, "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));

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
				WIDGET_HIDE_TIMETABLE = true;
				data.hideTimeTable = true;
				WIDGET_SHOW_FAILED_JOBS = false;
			}

			if (WIDGET_HIDE_TIMETABLE && WIDGET_HIDE_TIMETABLE === 'true') {
				data.hideTimeTable = WIDGET_HIDE_TIMETABLE;
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

			if ((WIDGET_SHOW_FAILED_JOBS && WIDGET_SHOW_FAILED_JOBS === 'true') && (data.status === 'success-with-warnings' || data.status === 'failed')) {
				data.showFailedJobs = WIDGET_SHOW_FAILED_JOBS;
				var failed_jobs = JSON.parse(
					Packages.get(CATEGORY_GITLAB_URL + "/api/v4/projects/" + projectID + "/pipelines/" + pipeline.id + "/jobs?scope=failed&per_page=100&page=1", "PRIVATE-TOKEN", CATEGORY_GITLAB_TOKEN));
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
