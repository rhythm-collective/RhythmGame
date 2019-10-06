import * as p5 from "p5";
import {accuracyManager, gameStarted, TimeManager, gameplayTimeManager, missManager} from "./gameplay";
import {Config, ScrollDirection} from "./config";
import {Note, NoteManager, NoteType} from "./note_manager";

class ScrollManager {
    systemTime: number = 0;
    timeManager: TimeManager = new TimeManager(0);

    canvasScrolled(e: WheelEvent) {
        let timeChange = e.deltaY * config.secondsPerPixel * 1000;
        this.systemTime += timeChange;
    }

    getGameTime() {
        return this.timeManager.getGameTime(this.systemTime);
    }
}

let canvas: HTMLCanvasElement;
export let displayManager: DisplayManager;
export let noteManager: NoteManager;
const gameContainer = document.getElementById("graphical-display-section");
export let config: Config = new Config(0.005, 60, ScrollDirection.UP, 0);
let scrollManager: ScrollManager = new ScrollManager();
config.updateAccuracySettings();

const sketch = (p: p5): void => {
    p.setup = function () {
        canvas = p.createCanvas(400, 600).elt;
    };

    p.draw = function () {
        if (displayManager != null) {
            if (gameStarted) {
                //let currentTime = scrollManager.getGameTime(); // Use this for debug mode
                let currentTime = gameplayTimeManager.getGameTime(performance.now());
                displayManager.currentTime = currentTime;
                missManager.update(currentTime);
            }
            else {
                displayManager.currentTime = scrollManager.getGameTime();
            }
            displayManager.draw(); //TODO: make draw require game time as an argument
        }
    };
};

new p5(sketch, gameContainer);

//TODO: Prevent duplicating actions in this function when changing input file
export function prepareDisplay(tracks: Note[][]) {
    noteManager = new NoteManager(tracks);
    displayManager = new DisplayManager(noteManager);
    accuracyManager.displayManager = displayManager;
    accuracyManager.noteManager = noteManager;
    canvas.addEventListener("wheel", e => scrollManager.canvasScrolled(e));
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
            case NoteType.HOLD_HEAD:
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

class Receptor {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw() {
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.save();
        ctx.strokeRect(this.x, this.y, 20, 20);
        ctx.restore();
    }
}

export class DisplayManager {
    noteManager: NoteManager;
    currentTime: number; // in seconds

    constructor(noteManager: NoteManager) {
        this.noteManager = noteManager;
        this.currentTime = 0;
    }

    draw() {
        this.clear();
        this.drawNotesAndConnectors();
        this.drawReceptors();
    }

    drawNotesAndConnectors() {
        let leastTime = this.getLeastTime(this.currentTime);
        let greatestTime = this.getGreatestTime(this.currentTime);
        this.drawAllConnectors(leastTime, greatestTime);
        this.drawAllNotes(leastTime, greatestTime);
    }

    drawAllNotes(leastTime: number, greatestTime: number) {
        let numTracks = this.noteManager.tracks.length;
        for (let i = 0; i < numTracks; i++) {
            this.drawNotesInTrack(leastTime, greatestTime, i, numTracks, this.currentTime);
        }
    }

    drawNotesInTrack(leastTime: number, greatestTime: number, trackNumber: number,
                     numTracks: number, currentTime: number) {
        let notes = this.noteManager.getNotesByTimeRange(leastTime, greatestTime, trackNumber);
        for (let i = 0; i < notes.length; i++) {
            this.drawNote(notes[i], trackNumber, numTracks, currentTime);
        }
    }

    drawNote(note: Note, trackNumber: number, numTracks: number, currentTime: number) {
        if (!note.isHit) {
            let x = this.getNoteX(trackNumber, numTracks);
            let y = this.getNoteY(note.time, currentTime);
            new NoteDisplay(x, y, note.type).draw();
        }
    }

    clear() {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
    }

    getLeastTime(currentTime: number) {
        let receptorGap: number; // the gap in the LATE direction
        if(config.scrollDirection == ScrollDirection.UP) {
            receptorGap = config.receptorYPosition;
        }
        else {
            receptorGap = this.getCanvasHeight() - config.receptorYPosition;
        }
        return currentTime - (receptorGap * config.secondsPerPixel);
    }

    getGreatestTime(currentTime: number) {
        let receptorGap: number; // the gap in the EARLY direction
        if(config.scrollDirection == ScrollDirection.UP) {
            receptorGap = this.getCanvasHeight() - config.receptorYPosition;
        }
        else {
            receptorGap = config.receptorYPosition;
        }
        return currentTime + (this.getCanvasHeight() * config.secondsPerPixel);
    }

    getNoteX(trackNumber: number, numTracks: number) {
        let noteTrackSize = this.getCanvasWidth() / (numTracks + (numTracks + 1) / 2);
        return (0.5 + trackNumber * 1.5) * noteTrackSize;
    }

    getNoteY(noteTime: number, currentTime: number) {
        let timeDistance = noteTime - currentTime;
        if(config.scrollDirection == ScrollDirection.UP) {
            return config.receptorYPosition + (timeDistance / config.secondsPerPixel);
        }
        else {
            return config.receptorYPosition - (timeDistance / config.secondsPerPixel);
        }
    }

    getCanvasWidth(): number {
        return canvas.width / 2;
    }

    getCanvasHeight(): number {
        return canvas.height / 2;
    }

    drawAllConnectors(leastTime: number, greatestTime: number) {
        let tracks = this.noteManager.tracks;
        for (let i = 0; i < tracks.length; i++) {
            this.drawConnectorsInTrack(leastTime, greatestTime, tracks[i], i,
                tracks.length, this.currentTime);
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

    drawReceptors() {
        let numTracks = this.noteManager.tracks.length;
        for (let i = 0; i < numTracks; i++) {
            new Receptor(this.getNoteX(i, numTracks), config.receptorYPosition).draw();
        }
    }
}
