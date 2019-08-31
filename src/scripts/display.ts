let canvas;

function prepareDisplay(tracks) {
	canvas = document.getElementById("canvas");
	canvas.height = 600;
	canvas.width = 400;
	let noteManager = new NoteManager(tracks, 6);
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

function NoteManager(tracks_, initialTime) {
	this.tracks = tracks_;
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
		for(let i = 0; i < this.tracks.length; i++) {
			this.drawNotesInTrack(leastTime, greatestTime, this.tracks[i], i,
								  this.tracks.length, this.currentTime);
		}
	}

	this.drawNotesInTrack = function(leastTime, greatestTime, track, trackNumber,
									 numTracks, currentTime) {
		let bounds = this.getFirstAndLastNotes(leastTime, greatestTime, track);
		for(let i = bounds.start; i <= bounds.stop; i++) {
			if(track[i].type === "1") {
				let x = this.getNoteX(trackNumber, numTracks);
				let y = this.getNoteY(track[i].time, currentTime);
				new Note(x, y).draw();
			}
		}
	}

	//TODO: properly indicate when there are NO notes to draw
	this.getFirstAndLastNotes = function(leastTime, greatestTime, track) {
		let i;
		for(i = 0; i < track.length; i++) {
			if(track[i].time > leastTime) {
				break;
			}
		}
		i = Math.max(0, i - 1);
		let j;
		for(j = i; j < track.length; j++) {
			if(track[j].time > greatestTime) {
				break;
			}
		}
		j = Math.max(0, j - 1);
		return {start: i, stop: j};
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

	this.getNoteX = function(trackNumber, numTracks) {
		let noteTrackSize = canvas.width / (numTracks + (numTracks + 1) / 2);
		return (0.5 + trackNumber * 1.5) * noteTrackSize;
	}

	this.getNoteY = function(noteTime, currentTime) {
		let timeDistance = noteTime - currentTime;
		return timeDistance / this.secondsPerPixel;
	}
}
