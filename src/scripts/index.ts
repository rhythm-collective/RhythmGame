import {config, Note, prepareDisplay} from "./display";
import {getNoteTimesForMode, getPartialParse, PartialParse} from "./parsing";
import {cleanupGame, startGame} from "./gameplay";
import {setUIState, SimfileState} from "./ui_state";

export class Mode {
    public type: string;
    public difficulty: string;
    public meter: string;
    public id: number;
}

let reader: FileReader;
let localStartedParse: PartialParse;
setUIState(SimfileState.NO_SIMFILE);
document.getElementById("upload").addEventListener("change", simfileUploaded);

export function loadFile(
    file: File,
    listener: (this: FileReader, ev: ProgressEvent<FileReader>) => any,
    options?: boolean | AddEventListenerOptions
) {
    reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("loadend", listener, options);
}

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export function simfileUploaded() {
    localStartedParse = undefined;
    cleanupGame();
    setUIState(SimfileState.SIMFILE_UPLOADED);
}

// noinspection JSUnusedLocalSymbols
export function preparseSimfile() {
    let upload: HTMLInputElement = <HTMLInputElement>(
        document.getElementById("upload")
    );
    let file: File = upload.files[0];
    loadFile(file, onFileLoaded);
}

function onFileLoaded() {
    let fileContents: string = <string>reader.result;
    startParse(fileContents);
}

function startParse(fileContents: string) {
    localStartedParse = getPartialParse(fileContents);
    let modeOptions: Mode[] = getModeOptionsForDisplay(localStartedParse.modes);
    cleanupGame();
    setUIState(SimfileState.SIMFILE_PREPARSED, modeOptions);
}

export function getModeOptionsForDisplay(modesAsStrings: Map<string, string>[]) {
    let modeOptions: Mode[] = [];
    for (let i = 0; i < modesAsStrings.length; i++) {
        let mode: Map<string, string> = modesAsStrings[i];
        modeOptions.push({type: mode.get("type"), difficulty: mode.get("difficulty"), meter: mode.get("meter"), id: i});
    }
    modeOptions.sort(compareModeOptions);
    return modeOptions;
}

export function compareModeOptions(a: Mode, b: Mode) {
    let typeA = a.type.toUpperCase();
    let typeB = b.type.toUpperCase();
    if (typeA != typeB) {
        if (typeA < typeB) {
            return -1;
        } else {
            return 1;
        }
    } else {
        let difficultyA = a.difficulty.toUpperCase();
        let difficultyB = b.difficulty.toUpperCase();
        if (difficultyA != difficultyB) {
            return difficultyRank(difficultyA) - difficultyRank(difficultyB);
        } else {
            let meterA = parseFloat(a.meter);
            let meterB = parseFloat(b.meter);
            if (meterA != meterB) {
                return meterA - meterB;
            }
        }
    }
    return a.id = b.id;
}

function difficultyRank(difficulty: string) {
    switch (difficulty) {
        case "BEGINNER":
            return 0;
        case "EASY":
            return 1;
        case "MEDIUM":
            return 2;
        case "HARD":
            return 3;
        case "CHALLENGE":
            return 4;
        case "EDIT":
            return 5;
        default:
            return 6;
    }
}

export function modeSelected() {
    cleanupGame();
    setUIState(SimfileState.DIFFICULTY_SELECTED);
}

// noinspection JSUnusedLocalSymbols
export function finishParse() {
    let selectedMode: number = parseInt((<HTMLInputElement>document.getElementById("mode-select")).value);
    let tracks: Note[][] = getNoteTimesForMode(selectedMode, localStartedParse);
    drawParse(tracks);
    cleanupGame();
    setUIState(SimfileState.SIMFILE_PARSED, tracks);
    document.addEventListener("keydown", (e) => (keyBindingManager.keyDown(e)));
}

function drawParse(tracks: Note[][]) {
    prepareDisplay(tracks);
}

class KeyBindingUIManager {
    expectingKeyInput: boolean = false;
    receivingElement: HTMLInputElement;

    keyDown(e: KeyboardEvent) {
        if(this.expectingKeyInput) {
            this.receivingElement.value = e.key.toUpperCase();
            this.expectingKeyInput = false;
        }
    }
}

let keyBindingManager: KeyBindingUIManager = new KeyBindingUIManager();

export function goToPrepareGameplay() {
    startGame();
}

export function bindingClicked(bindingIndex: number) {
    keyBindingManager.expectingKeyInput = true;
    keyBindingManager.receivingElement = <HTMLInputElement>document.getElementById("key-binding-field-" + bindingIndex);
}

export function configUpdated() {
    config.update();
}