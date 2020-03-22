import * as p5 from "p5";

import {Config} from "./config";
import {NoteManager} from "./note_manager";
import {ScrollDirection} from "./scroll_direction";
import {Note, NoteState, NoteType} from "./parsing";

class NoteDisplay {
    x: number;
    y: number;
    noteType: string;
    private sketchInstance: p5;
    noteSize: number;

    constructor(x: number, y: number, noteType: string, sketchInstance: p5, noteSize: number) {
        this.sketchInstance = sketchInstance;
        this.x = x;
        this.y = y;
        this.noteType = noteType;
        this.noteSize = noteSize;
    }

    draw() {
        let p = this.sketchInstance;
        p.push();
        p.fill("black");
        switch (this.noteType) {
            case NoteType.NORMAL:
                p.rect(this.x, this.y, 20, 20);

                break;
            case NoteType.HOLD_HEAD:
                p.rect(this.x, this.y, 20, 20);
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);;
                p.fill("white");
                p.text("v", this.x + 10, this.y + 16);
                break;
            case NoteType.TAIL:
                p.noFill();
                p.rect(this.x, this.y, 20, 20);
                break;
            case NoteType.ROLL_HEAD:
                p.rect(this.x, this.y, 20, 20);
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.fill("white");
                p.text("x", this.x + 10, this.y + 16);
                break;
            case NoteType.MINE:
                p.fill("black");
                p.circle(this.x + 10, this.y + 10, 24);
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.fill("white");
                p.text("X", this.x + 10, this.y + 18);
                break;
            default:
                p.noFill();
                p.rect(this.x, this.y, 20, 20);
                p.fill("black");
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.text("?", this.x + 10, this.y + 18);
                break;
        }
        p.pop();
    }
}

class HoldConnector {
    x: number;
    startY: number;
    endY: number;
    private sketchInstance: p5;

    constructor(x: number, startY: number, endY: number, sketchInstance: p5) {
        this.sketchInstance = sketchInstance;
        this.x = x;
        this.startY = startY;
        this.endY = endY;
    }

    draw() {
        let p = this.sketchInstance;
        p.push();
        p.fill("black");
        p.rect(this.x + 5, this.startY, 10, this.endY - this.startY);
        p.pop();
    }
}

class Receptor {
    x: number;
    y: number;
    private sketchInstance: p5;

    constructor(x: number, y: number, sketchInstance: p5) {
        this.sketchInstance = sketchInstance;
        this.x = x;
        this.y = y;
    }

    draw() {
        let p = this.sketchInstance;
        p.push();
        p.noFill();
        p.rect(this.x, this.y, 20, 20);
        p.pop();
    }
}

//TODO: Display missed notes differently than hit notes
export class DisplayManager {
    private config: Config;
    noteManager: NoteManager;
    private currentTimeInSeconds: number;
    private sketchInstance: p5;
    private topLeftX: number;
    private topLeftY: number;
    private width: number;
    private height: number;

    constructor(noteManager: NoteManager, config: Config, sketchInstance: p5, topLeftX: number = 40,
                topLeftY: number = 40, width: number = 180, height: number = 400) {
        this.config = config;
        this.noteManager = noteManager;
        this.currentTimeInSeconds = 0;
        this.sketchInstance = sketchInstance;
        this.topLeftX = topLeftX;
        this.topLeftY = topLeftY;
        this.width = width;
        this.height = height;
    }

    draw(currentTimeInSeconds: number) {
        this.currentTimeInSeconds = currentTimeInSeconds;
        this.sketchInstance.rect(this.topLeftX, this.topLeftY, this.width, this.height);
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
            new NoteDisplay(x, y, note.type, this.sketchInstance, this.config.noteSize).draw();
        }
    }

    private getLeastTime(currentTime: number) {
        let receptorGap: number; // the gap in the LATE direction
        if (this.config.scrollDirection == ScrollDirection.Up) {
            receptorGap = this.config.receptorYPosition;
        } else {
            receptorGap = this.getCanvasHeight() - this.config.receptorYPosition;
        }
        return currentTime - (receptorGap / this.config.pixelsPerSecond);
    }

    private getGreatestTime(currentTime: number) {
        let receptorGap: number; // the gap in the EARLY direction
        if (this.config.scrollDirection == ScrollDirection.Up) {
            receptorGap = this.getCanvasHeight() - this.config.receptorYPosition;
        } else {
            receptorGap = this.config.receptorYPosition;
        }
        return currentTime + (receptorGap / this.config.pixelsPerSecond);
    }

    private getNoteX(trackNumber: number, numTracks: number) {
        let noteTrackSize = this.getCanvasWidth() / (numTracks + (numTracks + 1) / 2);
        return (0.5 + trackNumber * 1.5) * noteTrackSize + this.topLeftX;
    }

    private getNoteY(noteTime: number, currentTime: number) {
        let timeDistance = noteTime - currentTime;
        if (this.config.scrollDirection == ScrollDirection.Up) {
            return this.config.receptorYPosition + (this.config.pixelsPerSecond * timeDistance) + this.topLeftY;
        } else {
            return this.config.receptorYPosition - (this.config.pixelsPerSecond * timeDistance) + this.topLeftY;
        }
    }

    private getCanvasWidth(): number {
        return this.width;
    }

    private getCanvasHeight(): number {
        return this.height;
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

        let endY = this.getNoteY(endNote.timeInSeconds - (this.config.noteSize / this.config.pixelsPerSecond), currentTime);
        new HoldConnector(x, startY, endY, this.sketchInstance).draw();
    }

    private drawReceptors() {
        let numTracks = this.noteManager.tracks.length;
        for (let i = 0; i < numTracks; i++) {
            new Receptor(this.getNoteX(i, numTracks), this.getNoteY(this.currentTimeInSeconds, this.currentTimeInSeconds),
                this.sketchInstance).draw();
        }
    }
}
