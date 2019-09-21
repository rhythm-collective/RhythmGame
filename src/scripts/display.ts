import * as p5 from "p5";
import {accuracyManager, gameStarted, timeHandler} from "./gameplay";

enum NoteType {
    NONE = "0",
    NORMAL = "1",
    HOLD_HEAD = "2",
    TAIL = "3",
    ROLL_HEAD = "4",
    MINE = "M",
}

export class Note {
    type: string;
    time: number;
    isHit: boolean;
}

let canvas: HTMLCanvasElement;
export let noteManager: NoteManager;
const gameContainer = document.getElementById("graphical-display-section");

const sketch = (p: p5): void => {
    p.setup = function() {
        canvas = p.createCanvas(400, 600).elt;
    };

    p.draw = function() {
        if(noteManager != null) {
            if(gameStarted) {
                noteManager.currentTime = timeHandler.getGameTime(performance.now()) / 1000;
            }
            noteManager.draw();
        }
    };
};

new p5(sketch, gameContainer);

//TODO: Prevent duplicating actions in this function when changing input file
export function prepareDisplay(tracks: Note[][]) {
    noteManager = new NoteManager(tracks, 1);
    accuracyManager.noteManager = noteManager;
    canvas.addEventListener("wheel", e => canvasScrolled(e));
}

function canvasScrolled(e: WheelEvent) {
    let timeChange = e.deltaY * noteManager.secondsPerPixel;
    noteManager.currentTime += timeChange;
}

class NoteDisplay {
    x: number;
    y: number;
    noteType: string;

    constructor(x: number, y: number, noteType: string) {
        this.x = x;
        this.y = y;
        this.noteType = noteType;
    }

    draw() {
        let ctx = canvas.getContext("2d");
        ctx.save();
        ctx.fillStyle = "black";
        switch (this.noteType) {
            case NoteType.NORMAL:
                ctx.fillRect(this.x, this.y, 20, 20);
                break;
            case NoteType.HOLD_HEAD: // Hold head
                ctx.fillRect(this.x, this.y, 20, 20);
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillText("v", this.x + 10, this.y + 16, 20);
                break;
            case NoteType.TAIL:
                ctx.strokeRect(this.x, this.y, 20, 20);
                break;
            case NoteType.ROLL_HEAD:
                ctx.fillRect(this.x, this.y, 20, 20);
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillText("x", this.x + 10, this.y + 16, 20);
                break;
            case NoteType.MINE:
                ctx.beginPath();
                ctx.arc(this.x + 10, this.y + 10, 12, 0, 2 * Math.PI);
                ctx.fill();
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "white";
                ctx.fillText("X", this.x + 10, this.y + 18, 20);
                break;
            default:
                ctx.strokeRect(this.x, this.y, 20, 20);
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText("?", this.x + 10, this.y + 18, 20);
                break;
        }
        ctx.restore();
    }
}

class HoldConnector {
    x: number;
    startY: number;
    endY: number;

    constructor(x: number, startY: number, endY: number) {
        this.x = x;
        this.startY = startY;
        this.endY = endY;
    }

    draw() {
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.save();
        ctx.fillRect(this.x + 5, this.startY, 10, this.endY - this.startY);
        ctx.restore();
    }
}

export class NoteManager {
    tracks: Note[][];
    secondsPerPixel: number;
    currentTime: number;
    onScreenNotes: Note[][];

    constructor(tracks_: Note[][], initialTime: number) {
        this.tracks = tracks_;
        this.secondsPerPixel = 0.005;
        this.currentTime = initialTime;
    }

    draw() {
        this.clear();
        this.drawNotesAndConnectors();
    }

    drawNotesAndConnectors() {
        let leastTime = this.getLeastTime(this.currentTime);
        let greatestTime = this.getGreatestTime(leastTime);
        this.drawAllConnectors(leastTime, greatestTime);
        this.drawAllNotes(leastTime, greatestTime);
    }

    drawAllNotes(leastTime: number, greatestTime: number) {
        this.onScreenNotes = [];
        for (let i = 0; i < this.tracks.length; i++) {
            this.onScreenNotes.push([]);
            this.drawNotesInTrack(leastTime, greatestTime, this.tracks[i], i,
                this.tracks.length, this.currentTime);
        }
    }

    drawNotesInTrack(leastTime: number, greatestTime: number, track: Note[], trackNumber: number,
                     numTracks: number, currentTime: number) {
        let bounds = this.getFirstAndLastNotes(leastTime, greatestTime, track);
        for (let i = bounds.start; i <= bounds.stop; i++) {
            this.drawNote(track[i], trackNumber, numTracks, currentTime);
        }
    }

    drawNote(note: Note, trackNumber: number, numTracks: number, currentTime: number) {
        this.onScreenNotes[trackNumber].push(note);
        if(!note.isHit) {
            let x = this.getNoteX(trackNumber, numTracks);
            let y = this.getNoteY(note.time, currentTime);
            new NoteDisplay(x, y, note.type).draw();
        }
    }

    //TODO: properly indicate when there are NO notes to draw
    getFirstAndLastNotes(leastTime: number, greatestTime: number, track: Note[]) {
        let i;
        for (i = 0; i < track.length; i++) {
            if (track[i].time > leastTime) {
                break;
            }
        }
        i = Math.max(0, i - 1);
        let j;
        for (j = i; j < track.length; j++) {
            if (track[j].time > greatestTime) {
                break;
            }
        }
        j = Math.max(0, j - 1);
        return {start: i, stop: j};
    }

    clear() {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
    }

    getLeastTime(currentTime: number) {
        return currentTime;
    }

    getGreatestTime(leastTime: number) {
        return leastTime + (canvas.height / 2) * this.secondsPerPixel;
    }

    getNoteX(trackNumber: number, numTracks: number) {
        let noteTrackSize = (canvas.width / 2) / (numTracks + (numTracks + 1) / 2);
        return (0.5 + trackNumber * 1.5) * noteTrackSize;
    }

    getNoteY(noteTime: number, currentTime: number) {
        let timeDistance = noteTime - currentTime;
        return timeDistance / this.secondsPerPixel;
    }

    drawAllConnectors(leastTime: number, greatestTime: number) {
        for (let i = 0; i < this.tracks.length; i++) {
            this.drawConnectorsInTrack(leastTime, greatestTime, this.tracks[i], i,
                this.tracks.length, this.currentTime);
        }
    }

    drawConnectorsInTrack(leastTime: number, greatestTime: number, track: Note[], trackNumber: number,
                          numTracks: number, currentTime: number) {
        let noteStack: Note[] = [];
        for (let i = 0; i < track.length; i++) {
            let currentNote: Note = track[i];
            if (currentNote.time < leastTime) {
                if (currentNote.type === NoteType.HOLD_HEAD || currentNote.type === NoteType.ROLL_HEAD) {
                    noteStack.push(currentNote);
                } else if (currentNote.type === NoteType.TAIL) {
                    noteStack.pop();
                }
            } else if (currentNote.time < greatestTime) {
                if (currentNote.type === NoteType.HOLD_HEAD || currentNote.type === NoteType.ROLL_HEAD) {
                    noteStack.push(currentNote);
                } else if (currentNote.type === NoteType.TAIL) {
                    let startNote = noteStack.pop();
                    let endNote = currentNote;
                    if (startNote != undefined && endNote != undefined) {
                        this.drawConnector(startNote, endNote, trackNumber, numTracks, currentTime);
                    }
                }
            } else {
                if (noteStack.length == 0) {
                    break;
                }
                if (currentNote.type === NoteType.HOLD_HEAD || currentNote.type === NoteType.ROLL_HEAD) {
                    noteStack.push(currentNote);
                } else if (currentNote.type === NoteType.TAIL) {
                    let startNote = noteStack.pop();
                    let endNote = currentNote;
                    if (startNote != undefined && endNote != undefined) {
                        this.drawConnector(startNote, endNote, trackNumber, numTracks, currentTime);
                    }
                }
            }
        }
    }

    drawConnector(startNote: Note, endNote: Note, trackNumber: number, numTracks: number, currentTime: number) {
        let x = this.getNoteX(trackNumber, numTracks);
        let startY = this.getNoteY(startNote.time, currentTime);
        let endY = this.getNoteY(endNote.time, currentTime);
        new HoldConnector(x, startY, endY).draw();
    }
}
