function play(data) {
	var audio = new Audio(); // create the HTML5 audio element
	var wave = new RIFFWAVE(); // create an empty wave file

	wave.header.sampleRate = 44100; // set sample rate to 44KHz
	wave.header.numChannels = 1; // one channel (mono)

	wave.Make(data);
	audio.src = wave.dataURI;
	audio.play();
}

function generateChromosome(id, type, params) {
	var chromosome = {};

	chromosome.color 		= chromosomeColor(type);
	chromosome.soundData 	= chromosomeSoundData(type, params);
	chromosome.params		= params;
	chromosome.type 		= type;
	chromosome.id			= id;

	return chromosome;
}

function chromosomeSoundData(type, params) {
	switch(type) {
		case "sine":
		return generateSine(params.hertz, params.length);
		break;
		case "square":
		return generateSquare(params.hertz, params.length);
		break;
		case "saw":
		return generateSaw(params.hertz, params.length);
		break;
	}
}


function chromosomeColor(type) {
	switch(type) {
		case "sine":
			return "#59ABE3"; // Blue-ish
			break;
		case "square":
			return "#26A65B"; // Green-ish
			break;
		case "saw":
			return "#F4B350"; // Orange-ish
			break;
	}
}


function generateSine(hertz, length) {
	var data = [];

	var x = 0;
	while(x < length) {
		data[x++] = 128+Math.round(127*Math.sin(x/(hertz)));
	}

	return data;
}

function generateSquare(hertz, length) {
	var data = [];

	var x = 0;
	while(x < length) {
		var val = 128+Math.round(127*Math.sin(x/(hertz)));
		if(val > 60) val = 128;
		if(val < 60) val = 0;
		data[x++] = val;
	}

	return data;
}

function generateSaw(hertz, length) {
	var data = [];

	var x = 0;
	while(x < length) {
		data[x++] = (x / (hertz / 10)) % 128;
	}

	return data;
}