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
}