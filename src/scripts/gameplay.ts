import {config, displayManager, DisplayManager} from "./display";
import {ScrollDirection} from "./config";
import {playAudio} from "./index";
import {Note, NoteManager} from "./note_manager";
import {keyBindingMenu} from "./ui_state";

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

class AccuracyManager {
    displayManager: DisplayManager;
    noteManager: NoteManager;
    timeHandler: TimeHandler;

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
            //TODO: accuracy doesn't seem to take the delay into account
            let accuracy = (note.time - receptorTimePosition) * 1000; // note time is in seconds
            console.log(this.getAccuracyName(accuracy) + " (" + Math.round(accuracy) + " ms)");
        }
    }

    getAccuracyRange() {
        let accuracySettings = config.accuracySettings;
        let numSettings = accuracySettings.length;
        let leastTime = accuracySettings[0].lowerBound == null ?
            accuracySettings[1].lowerBound : accuracySettings[0].lowerBound;
        let greatestTime;
        if(accuracySettings[numSettings - 1].upperBound == null) {
            //TODO: no early upper bound => Boos
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

    /*
    getReceptorTimePosition(receptorNumber: number) {
        if(config.scrollDirection == ScrollDirection.UP) {
            return this.timeHandler.getGameTime(performance.now()) +
                (config.receptorYPosition * config.secondsPerPixel * 1000);
        }
        else {
            return this.timeHandler.getGameTime(performance.now()) +
                    ((this.displayManager.getCanvasHeight() - config.receptorYPosition) *
                        config.secondsPerPixel * 1000);
        }
    }
     */

    getAccuracyName(timeDifference: number): string {
        if(timeDifference < -117) {
            return "MISS";
        }
        else if(timeDifference > 117) {
            return "BOO";
        }
        let absoluteTimeDifference: number = Math.abs(timeDifference);
        if(absoluteTimeDifference <= 117 && absoluteTimeDifference > 83) {
            return "AVERAGE";
        }
        else if(absoluteTimeDifference <= 83 && absoluteTimeDifference > 50) {
            return "GOOD";
        }
        else if(absoluteTimeDifference <= 50 && absoluteTimeDifference > 17) {
            return "PERFECT";
        }
        else if(absoluteTimeDifference <= 17) {
            return "AMAZING";
        }
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
export let timeHandler: TimeHandler;
export let gameStarted: boolean = false;
export let bindingManager: KeyBindingManager = new KeyBindingManager();

export function startGame() {
    delayNotes();
    if(gameStarted) {
        cleanupGame();
    }
    document.addEventListener("keydown", KeyHandler.keyDown);
    document.addEventListener("keyup", KeyHandler.keyUp);
    timeHandler = new TimeHandler(performance.now());
    accuracyManager.timeHandler = timeHandler;
    KeyHandler.timeHandler = timeHandler;
    KeyHandler.accuracyManager = accuracyManager;
    KeyHandler.bindingManager = bindingManager;
    playAudio();
    gameStarted = true;
}

function delayNotes() {
    let delay: number = parseFloat((<HTMLInputElement>document.getElementById("audio-start-delay")).value);
    let tracks = displayManager.noteManager.tracks;
    for(let i = 0; i < tracks.length; i++) {
        for(let j = 0; j < tracks[i].length; j++) {
            tracks[i][j].time -= delay / 1000;
        }
    }
}

export function cleanupGame() {
    if(gameStarted) {
        document.removeEventListener("keydown", KeyHandler.keyDown);
        document.removeEventListener("keyup", KeyHandler.keyUp);
        resetAllHitNotes();
        gameStarted = false;
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

class TimeHandler {
    systemTimeWhenGameStarted: number;

    constructor(systemTimeWhenGameStarted: number) {
        this.systemTimeWhenGameStarted = systemTimeWhenGameStarted;
    }

    getGameTime(systemTime: number): number {
        return (systemTime - this.systemTimeWhenGameStarted) / 1000; // in seconds
    }
}

// KeyHandler can't be a class because I want to be able to use document.removeEventListener
let KeyHandler: any = {
    timeHandler: undefined,
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
                //displayManager.currentTime, // uncomment for debug
                KeyHandler.timeHandler.getGameTime(performance.now()),
                KeyHandler.bindingManager.getTrackIndex(e.key),
                keyState
            )
        );
    }
}