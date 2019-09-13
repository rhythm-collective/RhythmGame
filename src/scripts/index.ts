import {prepareDisplay} from "./display";
import {getNoteTimesForMode, parseMetaData} from "./parsing";

let reader: FileReader;
let localStartedParse: Object;

// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
export function clearStartedParse() {
    document.getElementById("finish-parse-section").innerHTML = "";
    localStartedParse = undefined;
}

// noinspection JSUnusedLocalSymbols
export function go() {
    let upload: HTMLInputElement = <HTMLInputElement> document.getElementById("upload");
    let file: File = upload.files[0];
    reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('loadend', onFileLoaded);
}

function onFileLoaded() {
    let file: string = <string> reader.result;
    startParse(file);
}

function startParse(file) {
    localStartedParse = parseMetaData(file);
    let modeOptions: Array<Object> = getModeOptionsForDisplay(localStartedParse);
    showModeOptions(modeOptions);
}

export default function getModeOptionsForDisplay(metaData: Object) {
    let modes: Array<Object> = metaData["NOTES"];
    let modeOptions: Array<Object> = [];
    for(let i = 0; i < modes.length; i++) {
        let mode: Object = modes[i];
        modeOptions.push({type: mode["type"], difficulty: mode["difficulty"], meter: mode["meter"], id: i});
    }
    modeOptions.sort(compareModeOptions);
    return modeOptions;
}

class Mode {
    public type: string;
    public difficulty: string;
    public meter: string;
    public id: number;
}

function compareModeOptions(a: Mode, b: Mode) {
    let typeA = a.type.toUpperCase();
    let typeB = b.type.toUpperCase();
    if (typeA != typeB) {
        if(typeA < typeB) {
            return -1;
        }
        else {
            return 1;
        }
    }
    else {
        let difficultyA = a.difficulty.toUpperCase();
        let difficultyB = b.difficulty.toUpperCase();
        if(difficultyA != difficultyB) {
            return difficultyRank(difficultyA) - difficultyRank(difficultyB);
        }
        else {
            let meterA = parseFloat(a.meter);
            let meterB = parseFloat(b.meter);
            if(meterA != meterB) {
                return meterA - meterB;
            }
        }
    }
    return a.id = b.id;
}

function difficultyRank(difficulty: string) {
    switch(difficulty) {
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

function showModeOptions(modeOptions) {
    let modeSelect: HTMLElement = document.getElementById("finish-parse-section");
    let html: string = 'Choose a mode: <select id="mode-select">\n' +
        '<option hidden disabled selected value></option>\n';
    for(let i = 0; i < modeOptions.length; i++) {
        let mode: Mode = modeOptions[i];
        html += '<option value="' + mode["id"] + '">' +
            mode["type"] + ', ' + mode["difficulty"] + ', ' + mode["meter"] +
            '</option>\n';
    }
    html += '</select><br>\n';
    html += getFinishParseButton();
    modeSelect.innerHTML = html;
}

function getFinishParseButton() {
    return '<input type="button" value="Finish Parse" onclick="simparser.finishParse()"><br>';
}

// noinspection JSUnusedLocalSymbols
export function finishParse() {
    let selectedMode: string = (<HTMLInputElement> document.getElementById("mode-select")).value;
    let tracks: Array<Object> = getNoteTimesForMode(selectedMode, localStartedParse);
    console.log(tracks);
    //showParseInTextbox(tracks);
    drawParse(tracks);
}

function showParseInTextbox(parse) {
    document.getElementById("result-box-section").innerHTML =
        '<br><!--suppress HtmlUnknownAttribute --><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value=' +
        JSON.stringify(parse) + '>';
}

function drawParse(tracks) {
    document.getElementById("graphical-display-section").innerHTML =
        '<br><canvas id="canvas"></canvas>';
    prepareDisplay(tracks);
}
