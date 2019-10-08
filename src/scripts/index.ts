import {config, prepareDisplay} from "./display";
import {getFullParse, getPartialParse, PartialParse} from "./parsing";
import {bindingManager, cleanupGame, startGame} from "./gameplay";
import {
    AudioFileState,
    disableLoadAudioFileButton,
    disablePlayButton,
    SimfileState,
    updateAudioFileState,
    updateSimfileState
} from "./ui_state";
import {ConfigOption} from "./config";
import {Note} from "./note_manager";

/*
1) Get time position of the first note. If that note would be on screen at the start of the song, automatically
decrease the starting currentTime. Also take into account the earliest accuracy. Also display this calculated start
time and let the user configure it. Also use this additional delay to delay the start of the audio file.
2) Get time position of the last note. Use the time position of the last note, the latest accuracy, the end of the
audio file, and an arbitrary buffer value to determine when to officially end the song, eg:
Max( time position of last note + Max( 1 sec, - latest accuracy ), end of audio file )
3) Record accuracy and summarize at end of song
4) Be able to hit holds
5) Be able to hit mines
 */

export class Mode {
    public type: string;
    public difficulty: string;
    public meter: string;
    public id: number;
}

let simfileReader: FileReader;
let audioFileReader: FileReader;
let audioContext: AudioContext;
let audioSource: AudioBufferSourceNode;
let localStartedParse: PartialParse;
updateSimfileState(SimfileState.NO_SIMFILE);
updateAudioFileState(AudioFileState.NO_AUDIO_FILE);
document.addEventListener("keydown", (e) => (bindingManager.keyDown(e)));
//document.getElementById("upload").addEventListener("change", simfileUploaded);

export function loadTextFile(
    file: File,
    listener: (this: FileReader, ev: ProgressEvent<FileReader>) => any,
    options?: boolean | AddEventListenerOptions
) {
    simfileReader = new FileReader();
    simfileReader.readAsText(file);
    simfileReader.addEventListener("loadend", listener, options);
}

export function loadSoundFile(
    file: File,
    listener: (this: FileReader, ev: ProgressEvent<FileReader>) => any,
    options?: boolean | AddEventListenerOptions
) {
    audioFileReader = new FileReader();
    audioFileReader.readAsArrayBuffer(file);
    audioFileReader.addEventListener("loadend", listener, options);
}

export function audioFileUploaded() {
    updateAudioFileState(AudioFileState.AUDIO_FILE_UPLOADED);
}

export function bufferAudioFile() {
    disableLoadAudioFileButton();
    let audioUpload: HTMLInputElement = <HTMLInputElement>(
        document.getElementById("audio-upload")
    )
    let file: File = audioUpload.files[0];
    loadSoundFile(file, onAudioLoaded);
}

function onAudioLoaded() {
    // @ts-ignore
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioSource = audioContext.createBufferSource();
    audioContext.decodeAudioData(<ArrayBuffer>audioFileReader.result).then(audioBuffered,
        function(e){ console.log("Error with decoding audio data" + e.err); });
}

function audioBuffered(buffer: AudioBuffer) {
    audioSource.buffer = buffer;
    audioSource.connect(audioContext.destination);
    updateAudioFileState(AudioFileState.AUDIO_FILE_LOADED);
}

export function playAudio() {
    audioSource.start(0);
}

export function stopAudio() {
    audioSource.stop(0);
}

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export function simfileUploaded() {
    localStartedParse = undefined;
    cleanupGame();
    updateSimfileState(SimfileState.SIMFILE_UPLOADED);
}

// noinspection JSUnusedLocalSymbols
export function preparseSimfile() {
    let simfileUpload: HTMLInputElement = <HTMLInputElement>(
        document.getElementById("upload")
    );
    let file: File = simfileUpload.files[0];
    loadTextFile(file, onFileLoaded);
}

function onFileLoaded() {
    let fileContents: string = <string>simfileReader.result;
    startParse(fileContents);
}

function startParse(fileContents: string) {
    localStartedParse = getPartialParse(fileContents);
    let modeOptions: Mode[] = getModeOptionsForDisplay(localStartedParse.modes);
    cleanupGame();
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

export function modeSelected() {
    cleanupGame();
    updateSimfileState(SimfileState.DIFFICULTY_SELECTED);
}

// noinspection JSUnusedLocalSymbols
export function finishParse() {
    let selectedMode: number = parseInt((<HTMLInputElement>document.getElementById("mode-select")).value);
    let tracks: Note[][] = getFullParse(selectedMode, localStartedParse);
    prepareDisplay(tracks);
    cleanupGame();
    updateSimfileState(SimfileState.SIMFILE_PARSED, tracks.length);
}

export function goToPrepareGameplay() {
    disablePlayButton();
    startGame();
}

export function bindingClicked(bindingIndex: number) {
    bindingManager.expectingKeyInput = true;
    bindingManager.receivingIndex = bindingIndex;
}

export function configUpdated(configOptionCode: number) {
    switch(configOptionCode) {
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
    config.setPauseAtStartToDefault();
}