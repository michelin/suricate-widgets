function run() {
	var data = {};

	data.labels = [];
	data.datapie = [];
	data.colors = [];
	data.border = [];

	var json = JSON.parse(Packages.get(WIDGET_CONFIG_GITLAB_URL + "/api/v4/projects/" + SURI_PROJECT + "/languages", "PRIVATE-TOKEN", WIDGET_CONFIG_GITLAB_TOKEN));

	if (json) {
		data.labels = Object.keys(json);
		data.datapie = Object.keys(json).map(function(key){return json[key]})
		
		data.labels.forEach(function(label) {
			data.colors.push(stringToColour("COLOR" + label));
			data.border.push("#607D8B");
		});
		
		data.colors = JSON.stringify(data.colors);
		data.labels = JSON.stringify(data.labels);
		data.datapie = JSON.stringify(data.datapie);
		data.border = JSON.stringify(data.border);
	}
	
	return JSON.stringify(data);
}

function stringToColour(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var colour = '#';
	for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	}
	return colour;
};