import {NoteManager} from "./note_manager";
import {Config} from "./config";
import {handleAccuracyEvent} from "./handle_accuracy_event";
import {getMissBoundary} from "./util";
import {Note, NoteState, NoteType} from "./parsing";
import {HoldManager} from "./hold_manager";

export class MissManager {
    private config: Config;
    private noteManager: NoteManager;
    private nextUnmissedNoteIndices: number[];
    private accuracyRecording: { time: number, accuracy: number }[][];
    private holdManager: HoldManager;

    constructor(config: Config, noteManager: NoteManager, accuracyRecording: { time: number, accuracy: number }[][],
                holdManager: HoldManager) {
        this.config = config;
        this.noteManager = noteManager;
        this.nextUnmissedNoteIndices = [];
        for(let i = 0; i < this.noteManager.tracks.length; i++) {
            this.nextUnmissedNoteIndices.push(0);
        }
        this.accuracyRecording = accuracyRecording;
        this.holdManager = holdManager;
    }

    update(currentTime: number) {
        if (this.config.accuracySettings[0].lowerBound != null) {
            return; // A lowerBound for misses is incompatible with this way of doing misses
        }
        let numTracks = this.noteManager.tracks.length;
        let newNextUnmissedNoteIndices: number[] = this.getNewNextUnmissedNoteIndices(
            getMissBoundary(currentTime, this.config), numTracks);
        let allMissedNotes: Note[][] = this.findMissedNotes(numTracks, newNextUnmissedNoteIndices);
        this.handleMissedNotes(allMissedNotes, currentTime);
        this.updateNextUnmissedNoteIndices(numTracks, newNextUnmissedNoteIndices);
    }

    findMissedNotes(numTracks: number, newNextUnmissedNoteIndices: number[]) {
        let allMissedNotes: Note[][] = [];
        for(let i = 0; i < numTracks; i++) {
            let nextUnmissedNoteIndex = this.nextUnmissedNoteIndices[i];
            let newNextUnmissedNoteIndex = newNextUnmissedNoteIndices[i];
            if(newNextUnmissedNoteIndex > nextUnmissedNoteIndex) {
                let potentialMissedNotes: Note[] = this.noteManager.tracks[i].slice(nextUnmissedNoteIndex, newNextUnmissedNoteIndex);
                allMissedNotes.push(potentialMissedNotes.filter((note) => note.state == NoteState.DEFAULT));
            }
            else {
                allMissedNotes.push([]);
            }
        }
        return allMissedNotes;
    }

    getNewNextUnmissedNoteIndices(missBoundary: number, numTracks: number) {
        let earliestHittableNoteIndices: number[] = [];
        for(let i = 0; i < numTracks; i++) {
            let track: Note[] = this.noteManager.tracks[i];
            let index: number = this.noteManager.findIndexOfFirstNoteAfterTime(missBoundary, track,
                this.nextUnmissedNoteIndices[i]);
            earliestHittableNoteIndices.push(index);
        }
        return earliestHittableNoteIndices;
    }

    //TODO: Add option to disable tail misses
    handleMissedNotes(missedNotes: Note[][], currentTime: number) {
        for(let i = 0; i < missedNotes.length; i++) {
            for(let j = 0; j < missedNotes[i].length; j++) {
                handleAccuracyEvent(this.config.accuracySettings[0].name, i, -Infinity, currentTime, this.accuracyRecording);
                missedNotes[i][j].state = NoteState.MISSED;
                if(missedNotes[i][j].type == NoteType.TAIL) {
                    this.holdManager.heldTracks[i] = false; // Force a hold release upon missing the tail
                }
            }
        }
    }

    updateNextUnmissedNoteIndices(numTracks: number, newNextUnmissedNoteIndices: number[]) {
        for(let i = 0; i < numTracks; i++) {
            this.nextUnmissedNoteIndices[i] = Math.max(this.nextUnmissedNoteIndices[i], newNextUnmissedNoteIndices[i]);
        }
    }
}