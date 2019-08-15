function runTests(parse) {
	let test_case = getTest();
	let notes = parse.notes;
	let result = true;
	for(let i = 1; i < test_case.length; i++) {
		result = result && (notes[notes.length - i] == test_case[i])
	}
	console.log("Test completed with result " + (result ? "PASS" : "FAIL"));
}

function getTest() {
	return felyslong.split("\n").map(e => e.trim());
}

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
	console.log(getModeOptions({NOTES: modes}));
}