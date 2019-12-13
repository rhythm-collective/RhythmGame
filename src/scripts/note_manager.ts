import {Note} from "./parsing";

export class NoteManager {
    tracks: Note[][];

    constructor(tracks: Note[][]) {
        this.tracks = tracks;
    }

    getNotesByTimeRange(leastTime: number, greatestTime: number, trackNumber: number): { startIndex: number, endIndexNotInclusive: number } {
        let track = this.tracks[trackNumber];
        let firstFindResult = this.findIndexOfFirstNoteAfterTime(leastTime, track);
        if (firstFindResult < 0) {
            return {startIndex: -1, endIndexNotInclusive: -1}; // no notes left after least time
        }
        let lastFindResult = this.findIndexOfFirstNoteAfterTime(greatestTime, track, firstFindResult);
        if (lastFindResult < 0) {
            lastFindResult = track.length; // greatestTime exceeds the end of the notes
        }
        if (firstFindResult === 0) {
            if (lastFindResult === 0) {
                return {startIndex: -1, endIndexNotInclusive: -1}; // haven't seen first note
            } else {
                return {startIndex: 0, endIndexNotInclusive: lastFindResult}; // notes are just starting
            }
        }
        return {startIndex: firstFindResult, endIndexNotInclusive: lastFindResult};
    }

    // This function assumes that no two notes will have the same time in the same track
    findIndexOfFirstNoteAfterTime(keyTime: number, track: Note[], searchStart = 0) {
        for (let i = searchStart; i < track.length; i++) {
            if (track[i].timeInSeconds > keyTime) {
                return i;
            }
        }
        return -1;
    }

    getEarliestNote(): Note {
        let earliestNote: Note;
        for (let i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].length > 0) {
                let trackEarliestNote: Note = this.tracks[i][0];
                if (earliestNote == undefined) {
                    earliestNote = trackEarliestNote;
                } else if (earliestNote.timeInSeconds > trackEarliestNote.timeInSeconds) {
                    earliestNote = trackEarliestNote;
                }
            }
        }
        return earliestNote;
    }

    getLatestNote(): Note {
        let latestNote: Note;
        for (let i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].length > 0) {
                let trackLatestNote: Note = this.tracks[i][this.tracks[i].length - 1];
                if (latestNote == undefined) {
                    latestNote = trackLatestNote;
                } else if (latestNote.timeInSeconds < trackLatestNote.timeInSeconds) {
                    latestNote = trackLatestNote;
                }
            }
        }
        return latestNote;
    }

    getTotalNotes() {
        return this.tracks.reduce((sum, track) => sum + track.length, 0);
    }
}