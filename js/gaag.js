// Maybe this function is overkill? We create a new audio element,
// a new RiffWave object... We could create a singleton from the
// RiffWave object to save RAM (which probably fills up pretty
// fast at the moment), and increase speed on slower machines.
function play(data) {
	var audio = new Audio(); 	// create the HTML5 audio element
	var wave = new RIFFWAVE(); 	// create an empty wave file

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

function generateDNA(id, numChromosomes) {
	var DNA = {};
		DNA.id 			= id;
		DNA.chromosomes = [];

	var i = 0;

	// Generate chromosomes based on randomness
	// This should be the initial DNA strain
	while(i < numChromosomes) {
		DNA.chromosomes[i] = generateRandomChromosome(i);
		i++;
	}

	// Add all of the data together to pass through riffwave
	var data = [];
	DNA.chromosomes.forEach(function(entry) {
		data = data.concat(entry.soundData);
	});

	DNA.soundData = data;

	return DNA;
}

function generateRandomChromosome(id) {
	var rand = Math.random();

	var params = {};
		params.hertz 	= Math.random() * 15;
		params.length 	= Math.random() * 20000;

	var chromosome = {};

	if(rand < 0.2) {
		chromosome = generateChromosome(id, "sine", params);
	} else if(rand > 0.2 && rand < 0.4) {
		chromosome = generateChromosome(id, "square", params);
	} else if(rand > 0.4 && rand < 0.6) {
		chromosome = generateChromosome(id, "saw", params);
	} else {
		chromosome = generateChromosome(id, "triangle", params);
	}
	
	return chromosome;
}

function chromosomeSoundData(type, params) {
	switch(type) {
		case "sine":
			return generateSine(params.hertz, params.length);
		case "square":
			return generateSquare(params.hertz, params.length);
		case "saw":
			return generateSaw(params.hertz, params.length);
		case "triangle":
			return generateTriangle(params.hertz, params.length);
	}
}

function chromosomeColor(type) {
	switch(type) {
		case "sine":
			return "#59ABE3"; // Blue-ish
		case "square":
			return "#26A65B"; // Green-ish
		case "saw":
			return "#F4B350"; // Orange-ish
		case "triangle":
			return "#AEA8D3"; // Purplish
	}
}

/*
	Data mating functions
*/

function mateAvg(obj1, obj2) {
	var matedObj = [];
	
	// 	Check lowest array size. This ensures we don't
	//	work with null values (index out of bounds).
	var arrSize = Math.min(obj1.length, obj2.length);

	for(var i = 0; i < arrSize; i++) {
		matedObj[i] = Math.floor((obj1[i] + obj2[i]) / 2);
	}

	return matedObj;
}

function mateAvgRandom(obj1, obj2, randomEveryX) {
	var matedObj = [];

	var rand = Math.random();
	
	// 	Check lowest array size. This ensures we don't
	//	work with null values (index out of bounds).
	var arrSize = Math.min(obj1.length, obj2.length);

	for(var i = 0; i < arrSize; i++) {
		if(i % randomEveryX == 0) {
			var rand = Math.random();
		}

		if(rand < 0.3) {
			matedObj[i] = Math.floor((obj1[i] + obj2[i]) / 2);
		} else if(rand > 0.3 && rand < 0.6) {
			matedObj[i] = obj1[i];
		} else {
			matedObj[i] = obj2[i];
		}
	}

	return matedObj;
}

/*
	Waveform generation functions
*/

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

function generateTriangle(hertz, length) {
	var data = [];

	var x = 0;
	var rising = true;
	var val = 0;
	while(x < length) {
		if(rising) {
			data[x++] = val+=hertz;
			if(val >= 128) rising = false;
		} else {
			data[x++] = val-=hertz;
			if(val <= 0) rising = true;
		}
	}

	return data;
}

/* 
	Mutation
*/
function handleChromosomeArray(array) {
	var newChromosomeArray = [];
	var latestID = 0;
	var DNAID = 0;
	array.forEach(function(chromosome, iterator) {
		console.log("Iterator: " + iterator);

		var newChromosome = mutateChromosome(chromosome, 10);
			newChromosome.id = iterator;
			newChromosome.DNAID = parseInt(chromosome.DNAID) + 1;

		newChromosomeArray.push(newChromosome);
		latestID = iterator;
		DNAID = newChromosome.DNAID;
	});

	while(newChromosomeArray.length < 10) {
		newChromosomeArray.push(generateRandomChromosome(latestID++));
	}

	var DNA = {};
		DNA.id 			= DNAID;
		DNA.chromosomes = newChromosomeArray;

	// Add all of the data together to pass through riffwave
	var data = [];
	DNA.chromosomes.forEach(function(entry) {
		data = data.concat(entry.soundData);
	});
	DNA.soundData = data;

	return DNA;
}

function mutateChromosome(chromosome, mutationRate) {
	var newSoundData = [];
	chromosome.soundData.split(',').forEach(function(data, i) {
		var randVal = ((Math.random() * mutationRate) - (mutationRate / 2));
		newSoundData.push(parseInt(data) + randVal);
	});
	chromosome.soundData = newSoundData;
	console.log(chromosome);

	return chromosome;
}




