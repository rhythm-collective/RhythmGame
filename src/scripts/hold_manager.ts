import {NoteManager} from "./note_manager";

export class HoldManager {
    heldTracks: boolean[];
    private noteManager: NoteManager;

    constructor(noteManager: NoteManager) {
        this.noteManager = noteManager;
        this.heldTracks = [];
        for (let i = 0; i < this.noteManager.tracks.length; i++) {
            this.heldTracks.push(false);
        }
    }

    holdNote(trackNumber: number) {
        this.heldTracks[trackNumber] = true;
    }
}