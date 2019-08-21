/* Step One Of Parsing */

function parseMetaData(file) {
	let metaData = parseMainMetaDataTags(file);
	metaData["BPMS"] = parseBPMS(metaData["BPMS"]);
	parseNumericalTags(metaData);
	metaData["NOTES"] = parseModesAndDifficulties(file);
	return metaData;
}

function parseMainMetaDataTags(file) {
	// match any metadata tag excluding the "NOTES" tag (case-insensitive)
	let re = /#(?![nN][oO][tT][eE][sS])([^:]+):([^;]+);/g;
	let matches = [...file.matchAll(re)];
	let metaData = {};
	for(let i = 0; i < matches.length; i++) {
		let match = matches[i];
		metaData[cleanMetaDataString(match[1]).toUpperCase()] = cleanMetaDataString(match[2]);
	}
	return metaData;
}

function parseBPMS(bpmString) {
	let bpmArray = bpmString.split(",").map(e => e.trim().split("="));
	let bpms = [];
	for(let i = 0; i < bpmArray.length; i++) {
		bpms.push({beat: parseFloat(bpmArray[i][0]), bpm: parseFloat(bpmArray[i][1])});
	}
	return bpms;
}

function parseNumericalTags(metaData) {
	metaData["OFFSET"] = parseFloat(metaData["OFFSET"]);
	if(metaData["SAMPLELENGTH"]) {
		metaData["SAMPLELENGTH"] = parseFloat(metaData["SAMPLELENGTH"]);
	}
	if(metaData["SAMPLESTART"]) {
		metaData["SAMPLESTART"] = parseFloat(metaData["SAMPLESTART"]);
	}
}

function parseModesAndDifficulties(file) {
	// Get "NOTES" sections (case-insensitive). The first five values are postfixed with a colon.
	// Note data comes last, postfixed by a semicolon.
	let re = /#[nN][oO][tT][eE][sS]:([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^;]+;)/g;
	let matches = [...file.matchAll(re)];
	let modesAndDifficulties = [];
	let fieldNames = ["type", "desc/author", "difficulty", "meter", "radar"]
	for(let i = 0; i < matches.length; i++) {
		let match = matches[i];
		let mode = {};
		for(let j = 1; j < match.length-1; j++) {
			mode[fieldNames[j-1]] = cleanMetaDataString(match[j]);
		}
		mode["notes"] = match[match.length - 1];
		modesAndDifficulties.push(mode);
	}
	return modesAndDifficulties;
}

function cleanMetaDataString(string) {
	return string.trim().replace(/\n/g,"");
}

/* Step Two Of Parsing */

function getNoteTimesForMode(modeIndex, startedParse) {	
	let unparsedNotes = startedParse["NOTES"][modeIndex]["notes"];
	let unparsedArray = unparsedNotes.split("\n");
	let measures = getMeasures(unparsedArray);
	let beatsAndLines = getBeatInfoByLine(measures);
	let cleanedBeatsAndLines = removeBlankLines(beatsAndLines);
	let timesBeatsAndLines = getTimeInfoByLine(cleanedBeatsAndLines, 
		startedParse["OFFSET"], startedParse["BPMS"]);
	return timesBeatsAndLines;
}

function getMeasures(unparsedArray) {
	let measures = [];
	let state = 0;
	let i = 0;
	let currentMeasure = [];
	while(i < unparsedArray.length) {
		let currentLine = unparsedArray[i];
		switch(state) {
			case 0:
				if(!currentLine.includes("//") && currentLine.trim() !== "") {
					state = 1;
				}
				else {
					i++;
				}
				break;
			case 1:
				if(!currentLine.includes(",") && !currentLine.includes(";") && currentLine.trim() !== "") {
					currentMeasure.push(currentLine.trim());
					i++;
				}
				else {
					state = 2;
				}
				break;
			case 2:
				measures.push(currentMeasure);
				currentMeasure = [];
				i++;
				state = 0;
				break;
		}
	}
	return measures;
}

// assumes 4/4 time signature
function getBeatInfoByLine(measures) {
	beatsAndLines = [];
	let currentBeat = 0;
	for(let i = 0; i < measures.length; i++) {
		let measure = measures[i];
		for(let j = 0; j < measure.length; j++) {
			beatsAndLines.push({beat: currentBeat, lineInfo: measure[j]});
			currentBeat += 4 / measure.length;
		}
	}
	return beatsAndLines;
}

function removeBlankLines(beatsAndLines) {
	let cleanedBeatsAndLines = [];
	for(let i = 0; i < beatsAndLines.length; i++) {
		let line = beatsAndLines[i];
		if(!isAllZeros(line.lineInfo)) {
			cleanedBeatsAndLines.push(line);
		}
	}
	return cleanedBeatsAndLines;
}

function isAllZeros(string) {
	for(let i = 0; i < string.length; i++) {
		if(string.charAt(i) !== '0') {
			return false;
		}
	}
	return true;
}

function getTimeInfoByLine(infoByLine, offset, bpms) {
	let currentTime = -offset + getElapsedTime(0, infoByLine[0].beat, bpms);
	infoByLine[0].time = currentTime;
	for(let i = 1; i < infoByLine.length; i++) {
		let startBeat = infoByLine[i-1].beat;
		let endBeat = infoByLine[i].beat;
		currentTime += getElapsedTime(startBeat, endBeat, bpms);
		infoByLine[i].time = currentTime;
	}
	return infoByLine;
}

function getElapsedTime(startBeat, endBeat, bpms) {
	let currentBPMIndex = getStartBPMIndex(startBeat, bpms);
	let earliestBeat = startBeat;
	let elapsedTime = 0;
	do {
		let nextBPMChange = getNextBPMChange(currentBPMIndex, bpms);
		let nextBeat = Math.min(endBeat, nextBPMChange);
		elapsedTime += (nextBeat - earliestBeat) / bpms[currentBPMIndex].bpm * 60;
		earliestBeat = nextBeat;
		currentBPMIndex++;
	} while(earliestBeat < endBeat);
	return elapsedTime;
}

function getStartBPMIndex(startBeat, bpms) {
	let startBPMIndex = 0;
	for(let i = 1; i < bpms.length; i++) {
		if(bpms[i].beat < startBeat) {
			startBPMIndex = i;
		}
	}
	return startBPMIndex;
}

function getNextBPMChange(currentBPMIndex, bpms) {
	if(currentBPMIndex + 1 < bpms.length) {
		return bpms[currentBPMIndex + 1].beat;
	}
	return Number.POSITIVE_INFINITY;
}