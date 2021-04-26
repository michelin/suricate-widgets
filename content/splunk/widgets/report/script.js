// Colors for the matrix
var yellow = "1 0 0 0 0 0 1 0 0 0 0 0 0.25 0 0 0 0 0 1 0";
var sand = "1 0 0 0 0 0 1 0 0 0 -0.2 0.2 0.1 0.4 0 0 0 0 1 0";
var green = "-1 0.035 0.035 0.035 1 0 -1 0.11 0.11 1 0 0 -1 0 1 0 0 0 1 0";
var orange = "-1 0 0 0 1.8 0 -1 0 0 1.2 0 0 -1 0 1 0 0 0 1 0";
var red = "-1 0.51 0 0 1 0 -1 0.01295 0.01295 1 0 0 -1 0.021 1 0 0 0 1 0";
var emerald = "-1 0 0 0 1.076 0 -1 0.39 0.095 1.1 0 0 -1 0.43 1.1 0 0 0 1 0";
var white = "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0";
var softGrey = "1 0 0 0 -0.225 0 1 0 0 -0.24 0 0 1 0 -0.255 0 0 0 1 0";
var darkGrey = "-1 0.116 0 0 1 0 -1 0.165 0 1 0 0 -1 0.227 1 0 0 0 1 0";
var splunk = "0.45 0 0 0 0 0 0.69 0 0 0 0 0 0.22 0 0 0 0 0 1 0";

function run() {
	var data = JSON.parse(SURI_PREVIOUS);

	data.textColor = "#FFFFFF";

	if (typeof SURI_COLOR === 'undefined' || SURI_COLOR === null || SURI_COLOR === '' || SURI_COLOR.contains("CHOICE0")) {
		data.hexaColor = "#73AF37";
		data.matrixColor = splunk;
		data.textColor = "#000000";
	} else if (SURI_COLOR.contains("CHOICE1")) {
		data.hexaColor = "#FFFF89";
		data.matrixColor = yellow;
		data.textColor = "#000000";
	} else if (SURI_COLOR.contains("CHOICE2")) {
		data.hexaColor = "#e77c00";
		data.matrixColor = orange;
	} else if (SURI_COLOR.contains("CHOICE3")) {
		data.hexaColor = "#BD2D28";
		data.matrixColor = red;
	} else if (SURI_COLOR.contains("CHOICE4")) {
		data.hexaColor = "#4DC9C0";
		data.matrixColor = emerald;
	} else if (SURI_COLOR.contains("CHOICE5")) {
		data.hexaColor = "#FFFFBB";
		data.matrixColor = sand;
		data.textColor = "#000000";
	} else if (SURI_COLOR.contains("CHOICE6")) {
		data.hexaColor = "#FFFFFF";
		data.matrixColor = white;
		data.textColor = "#000000";
	} else if (SURI_COLOR.contains("CHOICE7")) {
		data.hexaColor = "#5C8100";
		data.matrixColor = green;
	} else if (SURI_COLOR.contains("CHOICE8")) {
		data.hexaColor = "#E5E2E0";
		data.matrixColor = softGrey;
		data.textColor = "#000000";
	} else if (SURI_COLOR.constructor("CHOICE9")) {
		data.hexaColor = "#5F7186";
		data.matrixColor = darkGrey;
	}

	var d = new Date(Date.now());
	//Set time to Paris timezone
	var offset = d.getTimezoneOffset();
	d.setHours(d.getHours() + ((120 + offset) / 60));
	data.timestamp = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : '' + d.getMinutes());

	return JSON.stringify(data);
}