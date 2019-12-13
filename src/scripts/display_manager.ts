import * as p5 from "p5";

import {Config} from "./config";
import {NoteManager} from "./note_manager";
import {ScrollDirection} from "./scroll_direction";
import {Note, NoteState, NoteType} from "./parsing";

class NoteDisplay {
    x: number;
    y: number;
    noteType: string;
    private canvas: HTMLCanvasElement;

    constructor(x: number, y: number, noteType: string, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.noteType = noteType;
    }

    draw() {
        let ctx = this.canvas.getContext("2d");
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
    private canvas: HTMLCanvasElement;

    constructor(x: number, startY: number, endY: number, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = x;
        this.startY = startY;
        this.endY = endY;
    }

    draw() {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.save();
        ctx.fillRect(this.x + 5, this.startY, 10, this.endY - this.startY);
        ctx.restore();
    }
}

class Receptor {
    x: number;
    y: number;
    private canvas: HTMLCanvasElement;

    constructor(x: number, y: number, canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
    }

    draw() {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.save();
        ctx.strokeRect(this.x, this.y, 20, 20);
        ctx.restore();
    }
}

//TODO: Display missed notes differently than hit notes
export class DisplayManager {
    private config: Config;
    noteManager: NoteManager;
    private canvas: HTMLCanvasElement;
    private currentTimeInSeconds: number;
    private p: p5;

    constructor(noteManager: NoteManager, canvas: HTMLCanvasElement, config: Config, p: p5) {
        this.config = config;
        this.canvas = canvas;
        this.noteManager = noteManager;
        this.currentTimeInSeconds = 0;
        this.p = p;
    }

    draw(currentTimeInSeconds: number) {
        this.currentTimeInSeconds = currentTimeInSeconds;
        this.clear();
        this.drawNotesAndConnectors();
        this.drawReceptors();
    }

    private drawNotesAndConnectors() {
        let leastTime = this.getLeastTime(this.currentTimeInSeconds);
        let greatestTime = this.getGreatestTime(this.currentTimeInSeconds);
        this.drawAllConnectors(leastTime, greatestTime);
        this.drawAllNotes(leastTime, greatestTime);
    }

    private drawAllNotes(leastTime: number, greatestTime: number) {
        let numTracks = this.noteManager.tracks.length;
        for (let i = 0; i < numTracks; i++) {
            this.drawNotesInTrack(leastTime, greatestTime, i, numTracks, this.currentTimeInSeconds);
        }
    }

    private drawNotesInTrack(leastTime: number, greatestTime: number, trackNumber: number,
                     numTracks: number, currentTime: number) {
        let noteIndexRange = this.noteManager.getNotesByTimeRange(leastTime, greatestTime, trackNumber);
        let notes = this.noteManager.tracks[trackNumber].slice(noteIndexRange.startIndex, noteIndexRange.endIndexNotInclusive);
        for (let i = 0; i < notes.length; i++) {
            this.drawNote(notes[i], trackNumber, numTracks, currentTime);
        }
    }

    private drawNote(note: Note, trackNumber: number, numTracks: number, currentTime: number) {
        if (note.state == NoteState.DEFAULT) {
            let x = this.getNoteX(trackNumber, numTracks);
            let y = this.getNoteY(note.timeInSeconds, currentTime);
            new NoteDisplay(x, y, note.type, this.canvas).draw();
        }
    }

    private clear() {
        let ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
    }

    private getLeastTime(currentTime: number) {
        let receptorGap: number; // the gap in the LATE direction
        if (this.config.scrollDirection == ScrollDirection.UP) {
            receptorGap = this.config.receptorYPosition;
        } else {
            receptorGap = this.getCanvasHeight() - this.config.receptorYPosition;
        }
        return currentTime - (receptorGap * this.config.secondsPerPixel);
    }

    private getGreatestTime(currentTime: number) {
        //TODO: Why aren't I using this variable?
        let receptorGap: number; // the gap in the EARLY direction
        if (this.config.scrollDirection == ScrollDirection.UP) {
            receptorGap = this.getCanvasHeight() - this.config.receptorYPosition;
        } else {
            receptorGap = this.config.receptorYPosition;
        }
        return currentTime + (receptorGap * this.config.secondsPerPixel);
    }

    private getNoteX(trackNumber: number, numTracks: number) {
        let noteTrackSize = this.getCanvasWidth() / (numTracks + (numTracks + 1) / 2);
        return (0.5 + trackNumber * 1.5) * noteTrackSize;
    }

    private getNoteY(noteTime: number, currentTime: number) {
        let timeDistance = noteTime - currentTime;
        if (this.config.scrollDirection == ScrollDirection.UP) {
            return this.config.receptorYPosition + (timeDistance / this.config.secondsPerPixel);
        } else {
            return this.config.receptorYPosition - (timeDistance / this.config.secondsPerPixel);
        }
    }

    private getCanvasWidth(): number {
        return this.p.width;
    }

    private getCanvasHeight(): number {
        return this.p.height;
    }

    private drawAllConnectors(leastTime: number, greatestTime: number) {
        let tracks = this.noteManager.tracks;
        for (let i = 0; i < tracks.length; i++) {
            this.drawConnectorsInTrack(leastTime, greatestTime, tracks[i], i,
                tracks.length, this.currentTimeInSeconds);
        }
    }

    private drawConnectorsInTrack(leastTime: number, greatestTime: number, track: Note[], trackNumber: number,
                          numTracks: number, currentTime: number) {
        let noteStack: Note[] = [];
        for (let i = 0; i < track.length; i++) {
            let currentNote: Note = track[i];
            if (currentNote.timeInSeconds < leastTime) {
                if (currentNote.type === NoteType.HOLD_HEAD || currentNote.type === NoteType.ROLL_HEAD) {
                    noteStack.push(currentNote);
                } else if (currentNote.type === NoteType.TAIL) {
                    noteStack.pop();
                }
            } else if (currentNote.timeInSeconds < greatestTime) {
                if (currentNote.type === NoteType.HOLD_HEAD || currentNote.type === NoteType.ROLL_HEAD) {
                    noteStack.push(currentNote);
                } else if (currentNote.type === NoteType.TAIL) {
                    let startNote = noteStack.pop();
                    let endNote = currentNote;
                    if (startNote != undefined && endNote != undefined) {
                        if ((startNote.state == NoteState.DEFAULT || startNote.state == NoteState.HELD) &&
                            endNote.state == NoteState.DEFAULT) {
                            this.drawConnector(startNote, endNote, trackNumber, numTracks, currentTime);
                        }
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
                        if ((startNote.state == NoteState.DEFAULT || startNote.state == NoteState.HELD) &&
                            endNote.state == NoteState.DEFAULT) {
                            this.drawConnector(startNote, endNote, trackNumber, numTracks, currentTime);
                        }
                    }
                }
            }
        }
    }

    private drawConnector(startNote: Note, endNote: Note, trackNumber: number, numTracks: number, currentTime: number) {
        let x = this.getNoteX(trackNumber, numTracks);

        let startY;
        if (startNote.state == NoteState.HELD) {
            startY = this.getNoteY(Math.min(currentTime, endNote.timeInSeconds), currentTime);
        } else {
            startY = this.getNoteY(startNote.timeInSeconds, currentTime);
        }

        let endY = this.getNoteY(endNote.timeInSeconds, currentTime);
        new HoldConnector(x, startY, endY, this.canvas).draw();
    }

    private drawReceptors() {
        let numTracks = this.noteManager.tracks.length;
        for (let i = 0; i < numTracks; i++) {
            new Receptor(this.getNoteX(i, numTracks), this.config.receptorYPosition, this.canvas).draw();
        }
    }
}
