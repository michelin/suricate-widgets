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