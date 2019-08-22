var canvas;

function prepareDisplay(timesBeatsAndLines) {
	canvas = document.getElementById("canvas");
	canvas.height = 600;
	canvas.width = 400;
	let noteManager = new NoteManager(timesBeatsAndLines, 6);
	noteManager.drawNotes();
	canvas.addEventListener("wheel", e => noteManager.canvasScrolled(e));
}

function Note(x_, y_) {
	this.x = x_;
	this.y = y_;
	this.draw = function() {
		let ctx = canvas.getContext("2d");
		ctx.save();
		ctx.fillRect(this.x, this.y, 20, 20);
		ctx.restore();
	}
}

function NoteManager(timesBeatsAndLines_, initialTime) {
	this.timesBeatsAndLines = timesBeatsAndLines_;
	this.secondsPerPixel = 0.005;
	this.currentTime = initialTime;
	
	this.canvasScrolled = function(e) {
		let timeChange = e.deltaY * this.secondsPerPixel;
		this.currentTime += timeChange;
		this.drawNotes();
	}
	
	this.drawNotes = function() {
		this.clear();
		let leastTime = this.getLeastTime(this.currentTime);
		let greatestTime = this.getGreatestTime(leastTime);
		let lineIndices = this.getFirstAndLastLines(leastTime, greatestTime);
		for(let i = lineIndices.start; i <= lineIndices.stop; i++) {
			this.drawAllNotesInLine(this.timesBeatsAndLines[i], this.currentTime);
		}
	}
	
	this.clear = function() {
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	
	this.getLeastTime = function(currentTime) {
		return currentTime;
	}
	
	this.getGreatestTime = function(leastTime) {
		return leastTime + canvas.height * this.secondsPerPixel;
	}
	
	this.getFirstAndLastLines = function(leastTime, greatestTime) {
		let i;
		for(i = 0; i < this.timesBeatsAndLines.length; i++) {
			if(this.timesBeatsAndLines[i].time > leastTime) {
				break;
			}
		}
		i = Math.max(0, i - 1);
		let j;
		for(j = i; j < this.timesBeatsAndLines.length; j++) {
			if(this.timesBeatsAndLines[j].time > greatestTime) {
				break;
			}
		}
		j = Math.max(0, j - 1);
		return {start: i, stop: j};
	}
	
	this.drawAllNotesInLine = function(line, currentTime) {
		let lineString = line.lineInfo;
		for(let i = 0; i < lineString.length; i++) {
			if(lineString.charAt(i) !== "0") {
				let x = this.getNoteX(i, lineString.length);
				let y = this.getNoteY(line.time, currentTime);
				new Note(x, y).draw();
			}
		}
	}
	
	this.getNoteX = function(trackNumber, numTracks) {
		let noteTrackSize = canvas.width / (numTracks + (numTracks + 1) / 2);
		return (0.5 + trackNumber * 1.5) * noteTrackSize;
	}
	
	this.getNoteY = function(noteTime, currentTime) {
		let timeDistance = noteTime - currentTime;
		return timeDistance / this.secondsPerPixel;
	}
}
