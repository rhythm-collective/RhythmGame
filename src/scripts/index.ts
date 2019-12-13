import {getFullParse, getPartialParse, PartialParse} from "./parsing";
import {
    AudioFileState,
    disablePlayButton,
    SimfileState, updateAudioFileState,
    updateSimfileState
} from "./ui_state";
import {Config, ConfigOption} from "./config";
import {loadSoundFile, loadTextFile} from "./file_util";
import {Globals} from "./globals";
import {PreviewDisplay} from "./preview_display";
import {KeyBindingManager} from "./key_binding_manager";
import {PlayingDisplay} from "./playing_display";
import {replaceNotYetImplementedNoteTypes, setAllNotesToDefault} from "./util";

export class Mode {
    public type: string;
    public difficulty: string;
    public meter: string;
    public id: number;
}

let localStartedParse: PartialParse;
export let config = new Config({});
let keyBindingManager = new KeyBindingManager(config);
document.addEventListener("keydown", (e) => (keyBindingManager.keyDown(e)));

// This function is called from HTML
export function simfileUploaded() {
    localStartedParse = undefined;
    updateSimfileState(SimfileState.SIMFILE_UPLOADED);
    let simfileUpload: HTMLInputElement = <HTMLInputElement>(document.getElementById("upload"));
    let file: File = simfileUpload.files[0];
    loadTextFile(file, (event: ProgressEvent<FileReader>) => {
        startParse(<string>event.target.result);
    });
}

export let audioSource: AudioBufferSourceNode;

// This function is called from HTML
export function audioFileUploaded() {
    updateAudioFileState(AudioFileState.AUDIO_FILE_UPLOADED);
    let audioUpload: HTMLInputElement = <HTMLInputElement>(document.getElementById("audio-upload"));
    let file: File = audioUpload.files[0];
    loadSoundFile(file, (event: ProgressEvent<FileReader>) => {
        // @ts-ignore
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioSource = audioContext.createBufferSource();
        audioContext.decodeAudioData(<ArrayBuffer>event.target.result).then((buffer: AudioBuffer) => {
                // gameStateManager.setAudioDuration(buffer.duration);
                audioSource.buffer = buffer;
                audioSource.connect(audioContext.destination);
                updateAudioFileState(AudioFileState.AUDIO_FILE_LOADED);
            },
            (e: any) => {
                console.log("Error with decoding audio data" + e.err);
            }); // Can e have a more specific type?
    });
}

function startParse(fileContents: string) {
    localStartedParse = getPartialParse(fileContents);
    let modeOptions: Mode[] = getModeOptionsForDisplay(localStartedParse.modes);
    updateSimfileState(SimfileState.SIMFILE_PREPARSED, modeOptions);
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

// This function is called from html that's generated in script
export function modeSelected() {
    updateSimfileState(SimfileState.DIFFICULTY_SELECTED);
    let selectedMode: number = parseInt((<HTMLInputElement>document.getElementById("mode-select")).value);
    Globals.PARSED_NOTES = getFullParse(selectedMode, localStartedParse);
    setAllNotesToDefault(Globals.PARSED_NOTES);
    replaceNotYetImplementedNoteTypes(Globals.PARSED_NOTES);
    Globals.CURRENT_GAME_AREA = new PreviewDisplay(Globals.PARSED_NOTES, config);
    updateSimfileState(SimfileState.SIMFILE_PARSED, Globals.PARSED_NOTES.length);
}

export function goToPrepareGameplay() {
    disablePlayButton();
    Globals.CURRENT_GAME_AREA.remove();
    Globals.CURRENT_GAME_AREA = new PlayingDisplay(Globals.PARSED_NOTES, config);
}

export function bindingClicked(bindingIndex: number) {
    keyBindingManager.expectingKeyInput = true;
    keyBindingManager.receivingIndex = bindingIndex;
}

export function configUpdated(configOptionCode: number) {
    switch (configOptionCode) {
        case ConfigOption.SECONDS_PER_PIXEL:
            config.updateSecondsPerPixel();
            break;
        case ConfigOption.RECEPTOR_Y_POSITION:
            config.updateReceptorYPosition();
            break;
        case ConfigOption.SCROLL_DIRECTION:
            config.updateScrollDirection();
            break;
        case ConfigOption.AUDIO_START_DELAY:
            config.updateAudioStartDelay();
            break;
        case ConfigOption.ACCURACY_SETTINGS:
            config.updateAccuracySettings();
            break;
        case ConfigOption.PAUSE_AT_START:
            config.updatePauseAtStart();
            break;
    }
}

export function autoPauseAtStart() {
    Globals.CURRENT_GAME_AREA.config.setPauseAtStartToDefault(Globals.CURRENT_GAME_AREA.noteManager);
}