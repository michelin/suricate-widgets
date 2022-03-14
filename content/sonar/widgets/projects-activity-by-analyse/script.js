function run() {
	var data = {};
	data.labels = [];
	data.datapie = [];
	data.colors = [];
	data.border = [];
	
	var projectsAndAnalysesQuantity = {};
	var pageSize = 500;
	var projectPage = 1;
	
	if (SURI_PERIOD) {
		var numberOfPeriods = 1;
		
		if (SURI_NUMBER_OF_PERIOD) {
			numberOfPeriods = SURI_NUMBER_OF_PERIOD;
		}
		
		var computedDate = new Date();
		
		if (SURI_PERIOD === "Day") {
			computedDate.setDate(new Date().getDate() - numberOfPeriods);
		} else if (SURI_PERIOD === "Week") {
			computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
		} else if (SURI_PERIOD === "Month") {
			computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
		} else if (SURI_PERIOD === "Year") {
			computedDate.setFullYear(new Date().getFullYear() - numberOfPeriods);
		}
		
		computedDate.setUTCHours(0, 0, 0, 0);
		
		data.fromDate = computedDate.getFullYear() + "-" + ("0" + (computedDate.getMonth() + 1)).slice(-2) + "-" + ("0" + computedDate.getUTCDate()).slice(-2);
	}
	
	var projectsNamesOrKeys = SURI_PROJECT.split(",");
	
	projectsNamesOrKeys.forEach(function(projectNameOrKey) {
		var projects = [];
		
		var response = JSON.parse(Packages.get(WIDGET_CONFIG_SONAR_URL + "/api/components/search?" 
						+ "qualifiers=TRK"
						+ "&q=" + projectNameOrKey
						+ "&ps=" + pageSize
						+ "&p=" + projectPage,
				"Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_SONAR_TOKEN + ":")));
	
		if (response && response.components && response.components.length > 0) {
			projects = projects.concat(response.components);
			
			while (response.paging.total > response.paging.pageIndex * response.paging.pageSize) {
				projectPage++;
				
				response = JSON.parse(Packages.get(WIDGET_CONFIG_SONAR_URL + "/api/components/search?"
							+ "qualifiers=TRK"
							+ "&q=" + projectNameOrKey
							+ "&ps=" + pageSize 
							+ "&p=" + projectPage,
					"Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_SONAR_TOKEN + ":")));
					
				projects = projects.concat(response.components);
			}
			
			projects.forEach(function(project) {				
				if (!projectsAndAnalysesQuantity[projectNameOrKey]) {
					projectsAndAnalysesQuantity[projectNameOrKey] = 0;
				}
				
				var projectAnalysesURL = WIDGET_CONFIG_SONAR_URL + "/api/project_analyses/search?project=" + project.key
											+ "&ps" + pageSize + "&p=1";
				
				if (data.fromDate) {
					projectAnalysesURL += "&from=" + data.fromDate;
				}
				
				var analysesResponse = JSON.parse(Packages.get(projectAnalysesURL, "Authorization", "Basic " + Packages.btoa(WIDGET_CONFIG_SONAR_TOKEN + ":")));
							
				projectsAndAnalysesQuantity[projectNameOrKey] += analysesResponse.paging.total;
			});
		}
	});
	
	var projectsAndAnalysesQuantityToArray = [];
	
	Object.keys(projectsAndAnalysesQuantity).forEach(function(project) {
		projectsAndAnalysesQuantityToArray.push([project, projectsAndAnalysesQuantity[project]]);
	});

	// Sort descending
	projectsAndAnalysesQuantityToArray.sort(function(project1, project2) {
		return project2[1] - project1[1];
	});
  
	projectsAndAnalysesQuantityToArray.forEach(function(project) {
		data.labels.push(project[0]);
		data.colors.push(stringToColour(project[0]));
		data.datapie.push(project[1]);
		data.border.push("#607D8B");
	});
	
	data.colors = JSON.stringify(data.colors);
	data.labels = JSON.stringify(data.labels);
	data.datapie = JSON.stringify(data.datapie);
	data.border = JSON.stringify(data.border);
  
	return JSON.stringify(data);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function stringToColour(str) {
  var hash = 0;
  var colour = '#';
  
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  
  return colour;
};
