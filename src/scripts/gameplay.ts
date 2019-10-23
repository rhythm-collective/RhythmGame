import {config, displayManager, DisplayManager, noteManager} from "./playing_display";
import {gameStateManager, playAudio} from "./index";
import {Note, NoteManager} from "./note_manager";
import {keyBindingMenu} from "./ui_state";
import {GameState} from "./game_state";

export class Accuracy {
    name: string;
    lowerBound: number;
    upperBound: number;

    constructor(name: string, lowerBound: number, upperBound: number) {
        this.name = name;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
}

export class MissManager {
    nextUnmissedNoteIndices: number[];

    constructor(numTracks: number) {
        this.nextUnmissedNoteIndices = [];
        for(let i = 0; i < numTracks; i++) {
            this.nextUnmissedNoteIndices.push(0);
        }
    }

    update(currentTime: number) {
        if (config.accuracySettings[0].lowerBound != null) {
            return; // A lowerBound for misses is incompatible with this way of doing misses
        }
        let numTracks = noteManager.tracks.length;
        let newNextUnmissedNoteIndices: number[] = this.getNewNextUnmissedNoteIndices(
            this.getMissBoundary(currentTime), numTracks);
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
                let potentialMissedNotes: Note[] = noteManager.tracks[i].slice(nextUnmissedNoteIndex, newNextUnmissedNoteIndex);
                allMissedNotes.push(potentialMissedNotes.filter((note) => !note.isHit));
            }
            else {
                allMissedNotes.push([]);
            }
        }
        return allMissedNotes;
    }

    getMissBoundary(currentTime: number) {
        let missBoundary = currentTime + (config.accuracySettings[0].upperBound / 1000); //result is in seconds
        return missBoundary;
    }

    getNewNextUnmissedNoteIndices(missBoundary: number, numTracks: number) {
        let earliestHittableNoteIndices: number[] = [];
        for(let i = 0; i < numTracks; i++) {
            let track: Note[] = noteManager.tracks[i];
            let index: number = noteManager.findIndexOfFirstNoteAfterTime(missBoundary, track,
                this.nextUnmissedNoteIndices[i]);
            earliestHittableNoteIndices.push(index);
        }
        return earliestHittableNoteIndices;
    }

    handleMissedNotes(missedNotes: Note[][], currentTime: number) {
        for(let i = 0; i < missedNotes.length; i++) {
            for(let j = 0; j < missedNotes[i].length; j++) {
                console.log(config.accuracySettings[0].name);
                gameStateManager.saveAccuracy(i, -Infinity, currentTime);
                missedNotes[i][j].isHit = true;
            }
        }
    }

    updateNextUnmissedNoteIndices(numTracks: number, newNextUnmissedNoteIndices: number[]) {
        for(let i = 0; i < numTracks; i++) {
            this.nextUnmissedNoteIndices[i] = Math.max(this.nextUnmissedNoteIndices[i], newNextUnmissedNoteIndices[i]);
        }
    }
}

class AccuracyManager {
    displayManager: DisplayManager;
    noteManager: NoteManager;
    timeManager: TimeManager;

    handlePlayerAction(action: PlayerKeyAction): void {
        if(action.keyState == KeyState.DOWN) {
            this.tryToHitNote(action.gameTime, action.track);
        }
    }

    tryToHitNote(currentTime: number, trackNumber: number) {
        let accuracyRange: {leastTime: number, greatestTime: number} = this.getAccuracyRange(); // in seconds
        let receptorTimePosition = currentTime; // in seconds
        let hittableRange: {leastTime: number, greatestTime: number} =
            this.getHittableRange(accuracyRange, receptorTimePosition);
        let notesInHittableRange: Note[] = this.noteManager.getNotesByTimeRange(hittableRange.leastTime,
            hittableRange.greatestTime, trackNumber);
        let note: Note = this.getEarliestUnhitNote(notesInHittableRange);
        if(note != null) {
            note.isHit = true;
            let accuracy = (note.time - receptorTimePosition) * 1000; // note time is in seconds
            gameStateManager.saveAccuracy(trackNumber, accuracy, currentTime);
            console.log(this.getAccuracyName(accuracy) + " (" + Math.round(accuracy) + " ms)");
        }
        else if (this.isConfiguredForBoos()) {
            gameStateManager.saveAccuracy(trackNumber, Infinity, currentTime);
            console.log(this.getAccuracyName(Infinity));
        }
    }

    getAccuracyRange() {
        let accuracySettings = config.accuracySettings;
        let numSettings = accuracySettings.length;
        let leastTime = accuracySettings[0].lowerBound == null ?
            accuracySettings[1].lowerBound : accuracySettings[0].lowerBound;
        let greatestTime;
        if(accuracySettings[numSettings - 1].upperBound == null) {
            greatestTime = accuracySettings[numSettings - 2].upperBound;
        }
        else {
            greatestTime = accuracySettings[numSettings - 1].upperBound;
        }
        return {leastTime: leastTime / 1000, greatestTime: greatestTime / 1000};
    }

    getHittableRange(accuracyRange: {leastTime: number, greatestTime: number}, receptorTimePosition: number) {
        return {
            leastTime: receptorTimePosition + accuracyRange.leastTime,
            greatestTime: receptorTimePosition + accuracyRange.greatestTime
        };
    }

    getEarliestUnhitNote(track: Note[]) {
        for(let i = 0; i < track.length; i++) {
            if(!track[i].isHit) {
                return track[i];
            }
        }
        return null;
    }

    //Expects timeDifference in milliseconds
    getAccuracyName(timeDifference: number): string {
        if(config.accuracySettings[0].lowerBound == null &&
            timeDifference < config.accuracySettings[0].upperBound) {
            return config.accuracySettings[0].name; // Handle miss if it exists
        }
        if(config.accuracySettings[config.accuracySettings.length - 1].upperBound == null &&
            timeDifference >= config.accuracySettings[config.accuracySettings.length - 1].lowerBound) {
            return config.accuracySettings[config.accuracySettings.length - 1].name; // Handle boo if it exists
        }
        for(let i = 0; i < config.accuracySettings.length; i++) {
            let accuracy: Accuracy = config.accuracySettings[i];
            if(accuracy.lowerBound != null && accuracy.upperBound != null) {
                if(accuracy.lowerBound < timeDifference && timeDifference <= accuracy.upperBound) {
                    return accuracy.name;
                }
            }
        }
        return "ERROR: Unknown accuracy";
    }

    isConfiguredForBoos(): boolean {
        return config.accuracySettings[config.accuracySettings.length - 1].upperBound == null;
    }
}

class KeyBindingManager {
    bindings: Map<string, number> = new Map();
    expectingKeyInput: boolean = false;
    receivingIndex: number;

    keyDown(e: KeyboardEvent) {
        if(this.expectingKeyInput) {
            let key: string = e.key.toUpperCase();
            this.getDisplayElement(this.receivingIndex).value = key;
            let previousBind = this.getKeyForTrack(this.receivingIndex);
            if(previousBind != null) {
                this.bindings.delete(previousBind);
            }
            this.bindings.set(key, this.receivingIndex);
            this.expectingKeyInput = false;
            this.updateAllBindingsDisplay();
        }
    }

    updateAllBindingsDisplay() {
        for(let i = 0; i < keyBindingMenu.currentNumTracks; i++) {
            let display = this.getDisplayElement(i);
            if(display != null) {
                display.value = this.getKeyForTrack(i);
            }
        }
    }

    getDisplayElement(trackNumber: number) {
        return <HTMLInputElement>document.getElementById("key-binding-field-" + trackNumber);
    }

    getTrackIndex(key: string): number {
        return this.bindings.get(key.toUpperCase());
    }

    getKeyForTrack(trackNumber: number) {
        for (let [key, value] of this.bindings.entries()) {
            if (value === trackNumber) {
                return key;
            }
        }
        return null;
    }
}

export let accuracyManager: AccuracyManager = new AccuracyManager();
export let gameplayTimeManager: TimeManager;
export let bindingManager: KeyBindingManager = new KeyBindingManager();
export let missManager: MissManager;

export function startGame() {
    if(gameStateManager.currentState == GameState.PLAYING) {
        cleanupGame();
    }
    document.addEventListener("keydown", KeyHandler.keyDown);
    document.addEventListener("keyup", KeyHandler.keyUp);
    gameplayTimeManager = new TimeManager(performance.now());
    accuracyManager.timeManager = gameplayTimeManager;
    missManager = new MissManager(noteManager.tracks.length);
    KeyHandler.timeManager = gameplayTimeManager;
    KeyHandler.accuracyManager = accuracyManager;
    KeyHandler.bindingManager = bindingManager;
    window.setTimeout(playAudio, config.pauseAtStart * 1000);
    gameStateManager.currentState = GameState.PLAYING;
    gameStateManager.initializeAccuracyRecording(noteManager.tracks.length);
}

export function cleanupGame() {
    if(gameStateManager.currentState == GameState.PLAYING) {
        document.removeEventListener("keydown", KeyHandler.keyDown);
        document.removeEventListener("keyup", KeyHandler.keyUp);
        resetAllHitNotes();
        gameStateManager.currentState = GameState.NOT_STARTED;
    }
}

function resetAllHitNotes() {
    let tracks = displayManager.noteManager.tracks;
    for(let i = 0; i < tracks.length; i++) {
        for(let j = 0; j < tracks[i].length; j++) {
            tracks[i][j].isHit = false;
        }
    }
}

enum KeyState {
    UP, DOWN,
}

class PlayerKeyAction {
    gameTime: number;
    track: number;
    keyState: KeyState;

    constructor(gameTime: number, track: number, keyState: KeyState) {
        this.gameTime = gameTime;
        this.track = track;
        this.keyState = keyState;
    }
}

export class TimeManager {
    systemTimeWhenGameStarted: number;

    constructor(systemTimeWhenGameStarted: number) {
        this.systemTimeWhenGameStarted = systemTimeWhenGameStarted;
    }

    private getElapsedTime(systemTime: number): number {
        return (systemTime - this.systemTimeWhenGameStarted) / 1000; // in seconds
    }

    getGameTime(systemTime: number) {
        return this.getElapsedTime(systemTime) + config.additionalOffset - config.pauseAtStart; // in seconds
    }
}

// KeyHandler can't be a class because I want to be able to use document.removeEventListener
let KeyHandler: any = {
    timeManager: undefined,
    accuracyManager: undefined,
    bindingManager: undefined,
    heldKeys: new Set<string>(),
    keyDown: function(e: KeyboardEvent) {
        if(!KeyHandler.heldKeys.has(e.key)) {
            KeyHandler.handleKeyboardEvent(e, KeyState.DOWN);
        }
    },
    keyUp: function(e: KeyboardEvent) {
        if(KeyHandler.heldKeys.has(e.key)) {
            KeyHandler.handleKeyboardEvent(e, KeyState.UP);
        }
    },
    handleKeyboardEvent: function(e: KeyboardEvent, keyState: KeyState) {
        if(keyState == KeyState.DOWN) {
            KeyHandler.heldKeys.add(e.key);
        }
        else {
            KeyHandler.heldKeys.delete(e.key);
        }
        KeyHandler.accuracyManager.handlePlayerAction(
            new PlayerKeyAction(
                //displayManager.currentTime, // uncomment for debug mode
                KeyHandler.timeManager.getGameTime(performance.now()),
                KeyHandler.bindingManager.getTrackIndex(e.key),
                keyState
            )
        );
    }
}