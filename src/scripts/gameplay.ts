import {Note, noteManager, NoteManager} from "./display";

class AccuracyManager {
    noteManager: NoteManager;
    timeHandler: TimeHandler;

    handlePlayerAction(action: PlayerKeyAction): void {
        if(action.keyState == KeyState.DOWN) {
            this.tryToHitNote(action.track);
        }
    }

    tryToHitNote(trackNumber: number) {
        let note: Note = this.getEarliestUnhitNote(trackNumber);
        if(note != null) {
            note.isHit = true;
            let accuracy = (note.time * 1000) - this.timeHandler.getGameTime(performance.now());
            console.log(this.getAccuracyName(accuracy) + " (" + Math.round(accuracy) + " ms)");
        }
    }

    getEarliestUnhitNote(trackNumber: number) {
        let track: Note[] = noteManager.onScreenNotes[trackNumber];
        for(let i = 0; i < track.length; i++) {
            if(!track[i].isHit) {
                return track[i];
            }
        }
    }

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

    getBindings(numBindings: number) {
        for(let trackIndex = 0; trackIndex < numBindings; trackIndex++) {
            let key = (<HTMLInputElement>document.getElementById("key-binding-field-" + trackIndex)).value;
            this.bindings.set(key, trackIndex);
        }
    }

    getTrackIndex(key: string): number {
        return this.bindings.get(key.toUpperCase());
    }
}

export let accuracyManager: AccuracyManager = new AccuracyManager();
export let timeHandler: TimeHandler;
export let gameStarted: boolean = false;

export function prepareGameplay() {
    let bindingManager: KeyBindingManager = new KeyBindingManager();
    let keyHandler = new KeyHandler();
    document.addEventListener("keydown", (e) => (keyHandler.keyDown(e)));
    document.addEventListener("keyup", (e) => (keyHandler.keyUp(e)));
    bindingManager.getBindings(noteManager.tracks.length);
    timeHandler = new TimeHandler(performance.now());
    gameStarted = true;
    accuracyManager.timeHandler = timeHandler;
    keyHandler.timeHandler = timeHandler;
    keyHandler.accuracyManager = accuracyManager;
    keyHandler.bindingManager = bindingManager;
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
        return systemTime - this.systemTimeWhenGameStarted;
    }
}

class KeyHandler {
    timeHandler: TimeHandler;
    accuracyManager: AccuracyManager;
    bindingManager: KeyBindingManager;

    keyDown(e: KeyboardEvent) {
        if(!e.repeat) {
            this.handleKeyboardEvent(e, KeyState.DOWN);
        }
    }

    keyUp(e: KeyboardEvent) {
        this.handleKeyboardEvent(e, KeyState.UP);
    }

    handleKeyboardEvent(e: KeyboardEvent, keyState: KeyState) {
        this.accuracyManager.handlePlayerAction(
            new PlayerKeyAction(
                this.timeHandler.getGameTime(performance.now()),
                this.bindingManager.getTrackIndex(e.key),
                keyState
            )
        );
    }
}