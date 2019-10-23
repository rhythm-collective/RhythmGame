export enum NoteType {
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

export class NoteManager {
    tracks: Note[][];

    constructor(tracks: Note[][]) {
        this.tracks = tracks;
    }

    getNotesByTimeRange(leastTime: number, greatestTime: number, trackNumber: number): Note[] {
        let track = this.tracks[trackNumber];
        let firstFindResult = this.findIndexOfFirstNoteAfterTime(leastTime, track);
        if(firstFindResult < 0) {
            return []; // no notes left
        }
        let lastFindResult = this.findIndexOfFirstNoteAfterTime(greatestTime, track, firstFindResult);
        if(lastFindResult < 0) {
            lastFindResult = track.length; // greatestTime exceeds the end of the notes
        }
        if(firstFindResult === 0) {
            if(lastFindResult === 0) {
                return []; // haven't seen first note
            }
            else {
                return track.slice(0, lastFindResult); // notes are just starting
            }
        }
        return track.slice(firstFindResult, lastFindResult); // remember that the end index is not inclusive
    }

    findIndexOfFirstNoteAfterTime(keyTime: number, track: Note[], searchStart = 0) {
        for (let i = searchStart; i < track.length; i++) {
            if (track[i].time > keyTime) {
                return i;
            }
        }
        return -1;
    }

    getEarliestNote(): Note {
        let earliestNote: Note;
        for(let i = 0; i < this.tracks.length; i++) {
            if(this.tracks[i].length > 0) {
                let trackEarliestNote: Note = this.tracks[i][0];
                if(earliestNote == undefined) {
                    earliestNote = trackEarliestNote;
                } else if(earliestNote.time > trackEarliestNote.time) {
                    earliestNote = trackEarliestNote;
                }
            }
        }
        return earliestNote;
    }

    getLatestNote(): Note {
        let latestNote: Note;
        for(let i = 0; i < this.tracks.length; i++) {
            if(this.tracks[i].length > 0) {
                let trackLatestNote: Note = this.tracks[i][this.tracks[i].length - 1];
                if(latestNote == undefined) {
                    latestNote = trackLatestNote;
                } else if(latestNote.time < trackLatestNote.time) {
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