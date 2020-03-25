import {Config} from "./config";
import {Note, NoteState, NoteType} from "./parsing";

export function defaultIfUndefined(value: any, defaultValue: any): any {
    return isUndefined(value) ? defaultValue : value;
}

export function isUndefined(value: any): boolean {
    return typeof value === "undefined";
}

export function saveAccuracy(accuracyRecording: { time: number, accuracy: number }[][],trackNumber: number,
                             accuracyInMilliseconds: number, gameTime: number) {
    accuracyRecording[trackNumber].push({time: gameTime, accuracy: accuracyInMilliseconds});
}

export function setAllNotesToDefault(tracks: Note[][]) {
    for(let i = 0; i < tracks.length; i++) {
        for(let j = 0; j < tracks[i].length; j++) {
            tracks[i][j].state = NoteState.DEFAULT;
        }
    }
}

export function replaceNotYetImplementedNoteTypes(tracks: Note[][]) {
    for(let i = 0; i < tracks.length; i++) {
        for(let j = 0; j < tracks[i].length; j++) {
            switch(NoteType[tracks[i][j].type as keyof typeof NoteType]) {
                case NoteType.TAIL:
                    break;
                case NoteType.MINE:
                    tracks[i][j].type = NoteType.NONE; //TODO: implement mines
                    break;
                case NoteType.HOLD_HEAD:
                    break;
                case NoteType.NONE:
                    break;
                case NoteType.ROLL_HEAD:
                    tracks[i][j].type = NoteType.HOLD_HEAD; //TODO: implement rolls
                    break;
                case NoteType.NORMAL:
                    break;
            }
        }
    }
}

export function getMissBoundary(currentTime: number, config: Config) {
    let missBoundary = currentTime + (config.accuracySettings[0].upperBound / 1000); //result is in seconds
    return missBoundary;
}

