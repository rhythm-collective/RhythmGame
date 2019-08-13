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