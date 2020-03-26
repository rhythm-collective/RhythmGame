import * as p5 from "p5";

import {Config} from "../scripts/config";
import {NoteManager} from "./note_manager";
import {ScrollDirection} from "./scroll_direction";
import {Note, NoteState, NoteType} from "./parsing";

class NoteDisplay {
    centerX: number;
    centerY: number;
    noteType: string;
    private sketchInstance: p5;
    noteSize: number;

    constructor(centerX: number, centerY: number, noteType: string, sketchInstance: p5, noteSize: number) {
        this.sketchInstance = sketchInstance;
        this.centerX = centerX;
        this.centerY = centerY;
        this.noteType = noteType;
        this.noteSize = noteSize;
    }

    draw() {
        let p = this.sketchInstance;
        let width = 20;
        let height = 20;
        p.push();
        p.fill("black");
        switch (this.noteType) {
            case NoteType.NORMAL:
                p.rect(this.centerX - width / 2, this.centerY - height / 2, width, height);
                break;
            case NoteType.HOLD_HEAD:
                p.rect(this.centerX - width / 2, this.centerY - height / 2, width, height);
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.fill("white");
                p.text("v", this.centerX, this.centerY + 6);
                break;
            case NoteType.TAIL:
                p.noFill();
                p.rect(this.centerX - width / 2, this.centerY - height / 2, width, height);
                break;
            case NoteType.ROLL_HEAD:
                p.rect(this.centerX - width / 2, this.centerY - height / 2, width, height);
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.fill("white");
                p.text("x", this.centerX, this.centerY + 6);
                break;
            case NoteType.MINE:
                p.fill("black");
                p.circle(this.centerX, this.centerY, 24);
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.fill("white");
                p.text("X", this.centerX, this.centerY + 8);
                break;
            default:
                p.noFill();
                p.rect(this.centerX - width / 2, this.centerY - height / 2, width, height);
                p.fill("black");
                p.textSize(20);
                p.textFont("Arial");
                p.textAlign(p.CENTER);
                p.text("?", this.centerX, this.centerY + 7);
                break;
        }
        p.pop();
    }
}

class HoldConnector {
    centerX: number;
    startY: number;
    endY: number;
    private sketchInstance: p5;

    constructor(centerX: number, startY: number, endY: number, sketchInstance: p5) {
        this.sketchInstance = sketchInstance;
        this.centerX = centerX;
        this.startY = startY;
        this.endY = endY;
    }

    draw() {
        let p = this.sketchInstance;
        let width = 10;
        p.push();
        p.fill("black");
        p.rect(this.centerX - width / 2, this.startY, width, this.endY - this.startY);
        p.pop();
    }
}

class Receptor {
    centerX: number;
    centerY: number;
    private sketchInstance: p5;

    constructor(centerX: number, centerY: number, sketchInstance: p5) {
        this.sketchInstance = sketchInstance;
        this.centerX = centerX;
        this.centerY = centerY;
    }

    draw() {
        let p = this.sketchInstance;
        let width = 20;
        let height = 20;
        p.push();
        p.noFill();
        p.rect(this.centerX - width / 2, this.centerY - height / 2, width, height);
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
            let x = this.getNoteCenterX(trackNumber, numTracks);
            let y = this.getNoteCenterY(note.timeInSeconds, currentTime);
            new NoteDisplay(x, y, note.type, this.sketchInstance, this.config.noteSize).draw();
        }
    }

    private getLeastTime(currentTime: number) {
        let totalDisplaySeconds = this.getDisplayHeight() / this.config.pixelsPerSecond;
        return currentTime - this.config.receptorYPercent / 100 * totalDisplaySeconds;
    }

    private getGreatestTime(currentTime: number) {
        let totalDisplaySeconds = this.getDisplayHeight() / this.config.pixelsPerSecond;
        return currentTime + (1 - this.config.receptorYPercent / 100) * totalDisplaySeconds;
    }

    private getNoteCenterX(trackNumber: number, numTracks: number) {
        let receptorSpacing = this.getDisplayWidth() / numTracks - this.config.noteSize;
        return (2 * trackNumber + 1) / 2 * (this.config.noteSize + receptorSpacing) + this.topLeftX;
    }

    // This essentially defines a conversion from seconds to pixels
    private getNoteCenterY(noteTime: number, currentTime: number) {
        let noteYOffset = this.config.pixelsPerSecond * (noteTime - currentTime);
        let receptorYOffset = this.config.receptorYPercent / 100 * this.getDisplayHeight();
        if (this.config.scrollDirection == ScrollDirection.Up) {
            return receptorYOffset + noteYOffset + this.topLeftY;
        } else {
            return this.getDisplayHeight() - (receptorYOffset + noteYOffset) + this.topLeftY;
        }
    }

    private getDisplayWidth(): number {
        return this.width;
    }

    private getDisplayHeight(): number {
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
        let x = this.getNoteCenterX(trackNumber, numTracks);

        let startY;
        if (startNote.state == NoteState.HELD) {
            startY = this.getNoteCenterY(Math.min(currentTime, endNote.timeInSeconds), currentTime);
        } else {
            startY = this.getNoteCenterY(startNote.timeInSeconds, currentTime);
        }

        let endY = this.getNoteCenterY(endNote.timeInSeconds - (this.config.noteSize / this.config.pixelsPerSecond / 2), currentTime);
        new HoldConnector(x, startY, endY, this.sketchInstance).draw();
    }

    private drawReceptors() {
        let numTracks = this.noteManager.tracks.length;
        for (let i = 0; i < numTracks; i++) {
            new Receptor(this.getNoteCenterX(i, numTracks), this.getNoteCenterY(this.currentTimeInSeconds, this.currentTimeInSeconds),
                this.sketchInstance).draw();
        }
    }
}
