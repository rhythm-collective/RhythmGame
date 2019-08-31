/// <reference path="index.ts" />
/// <reference path="parsing.ts" />

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
function runTest(fileText, expectedTimes) {
	let times = getNoteTimesForMode(3, parseMetaData(fileText)).map(o => o.time);
	let result = true;
	for(let i = 0; i < expectedTimes.length; i++) {
		result = result && (Math.abs(times[times.length - i - 1] - expectedTimes[i]) < 0.0001);
	}
	console.log("Test completed with result " + (result ? "PASS" : "FAIL"));
}

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
function getChaozAirflowTest() {
	return [122.084];
}

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
function modeTest() {
	let modes = [
	{type:"dance-solo", difficulty:"Easy", meter: 4},
	{type:"dance-single", difficulty:"Easy", meter: 5},
	{type:"dance-solo", difficulty:"Hard", meter: 15},
	{type:"dance-single", difficulty:"Hard", meter: 8},
	{type:"dance-solo", difficulty:"Medium", meter: 8},
	{type:"dance-single", difficulty:"Medium", meter: 6},
	{type:"dance-solo", difficulty:"Edit", meter: 20},
	{type:"dance-single", difficulty:"Challenge", meter: 12}
	];
	console.log(getModeOptionsForDisplay({NOTES: modes}));
}