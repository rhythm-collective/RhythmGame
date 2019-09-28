import {Mode} from "./index";
import {Note} from "./display";

export enum SimfileState {
    NO_SIMFILE,
    SIMFILE_UPLOADED,
    SIMFILE_PREPARSED,
    DIFFICULTY_SELECTED,
    SIMFILE_PARSED,
}

export enum AudioFileState {
    NO_AUDIO_FILE,
    AUDIO_FILE_UPLOADED,
    AUDIO_FILE_LOADED,
}

let simfileState: SimfileState;
let audioFileState: AudioFileState;

enum UIID {
    UPLOAD_SIMFILE_SECTION = "upload-simfile-section",
    UPLOAD_AUDIO_FILE_SECTION= "upload-audio-file-section",
    START_PARSE_SECTION = "start-parse-section",
    LOAD_AUDIO_FILE_SECTION = "load-audio-file-section",
    SELECT_MODE_SECTION = "select-mode-section",
    FINISH_PARSE_SECTION = "finish-parse-section",
    GRAPHICAL_DISPLAY_SECTION = "graphical-display-section",
    GAMEPLAY_SETTINGS_SECTION = "gameplay-settings-section",
    KEY_BINDING_MENU = "key-binding-menu",
    PLAY_BUTTON = "play-button",
}

class UploadSimfileSection {
    show() {
        document.getElementById(UIID.UPLOAD_SIMFILE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.UPLOAD_SIMFILE_SECTION).style.display = "none";
    }
}

class UploadAudioFileSection {
    show() {
        document.getElementById(UIID.UPLOAD_AUDIO_FILE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.UPLOAD_AUDIO_FILE_SECTION).style.display = "none";
    }
}

class StartParseSection {
    show() {
        document.getElementById(UIID.START_PARSE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.START_PARSE_SECTION).style.display = "none";
    }
}

class LoadAudioFileSection {
    show() {
        document.getElementById(UIID.LOAD_AUDIO_FILE_SECTION).style.display = "";
        (<HTMLInputElement>document.getElementById(UIID.LOAD_AUDIO_FILE_SECTION)).disabled = false;
    }

    hide() {
        document.getElementById(UIID.LOAD_AUDIO_FILE_SECTION).style.display = "none";
    }

    disable() {
        (<HTMLInputElement>document.getElementById(UIID.LOAD_AUDIO_FILE_SECTION)).disabled = true;
    }
}

class SelectModeSection {
    show(modeOptions: Mode[] | null) {
        if(modeOptions != null) {
            document.getElementById(UIID.SELECT_MODE_SECTION).innerHTML = this.get(modeOptions);
        }
        document.getElementById(UIID.SELECT_MODE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.SELECT_MODE_SECTION).style.display = "none";
    }

    get(modeOptions: Mode[]) {
        let html: string = 'Choose a mode: <select id="mode-select" onchange="simparser.modeSelected()">\n' +
            '<option hidden disabled selected value></option>\n';
        for (let i = 0; i < modeOptions.length; i++) {
            let mode: Mode = modeOptions[i];
            html += '<option value="' + mode.id + '">' +
                mode.type + ', ' + mode.difficulty + ', ' + mode.meter +
                '</option>\n';
        }
        html += '</select><br>\n';
        return html;
    }
}

class FinishParseSection {
    show() {
        document.getElementById(UIID.FINISH_PARSE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.FINISH_PARSE_SECTION).style.display = "none";
    }
}

class GraphicalDisplaySection {
    show() {
        document.getElementById(UIID.GRAPHICAL_DISPLAY_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.GRAPHICAL_DISPLAY_SECTION).style.display = "none";
    }
}

class GameplaySettingsSection {
    show() {
        document.getElementById(UIID.GAMEPLAY_SETTINGS_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UIID.GAMEPLAY_SETTINGS_SECTION).style.display = "none";
    }
}

class KeyBindingMenu {
    show(tracks: Note[][] | null) {
        if (tracks != null) {
            document.getElementById(UIID.KEY_BINDING_MENU).innerHTML =
                this.getKeyBindingMenu(tracks.length) + '<br>';
        }
        document.getElementById(UIID.KEY_BINDING_MENU).style.display = "";
    }

    getKeyBindingMenu(numTracks: number): string {
        let keyBindingOptions: string = "";
        for(let i = 0; i < numTracks; i++) {
            keyBindingOptions += '<input type="button" value="Key #' + (i + 1) + '" onclick="simparser.bindingClicked(' + i + ')">' +
                '<input type="text" size="10" style="margin: 0px 20px 0px 5px;" id="key-binding-field-' + i + '">';
        }
        return keyBindingOptions;
    }

    hide() {
        document.getElementById(UIID.KEY_BINDING_MENU).style.display = "none";
    }
}

class PlayButton {
    show() {
        document.getElementById(UIID.PLAY_BUTTON).style.display = "";
        (<HTMLInputElement>document.getElementById(UIID.PLAY_BUTTON)).disabled = false;
    }

    hide() {
        document.getElementById(UIID.PLAY_BUTTON).style.display = "none";
    }

    disable() {
        (<HTMLInputElement>document.getElementById(UIID.PLAY_BUTTON)).disabled = true;
    }
}

let uploadSimfileSection: UploadSimfileSection = new UploadSimfileSection();
let uploadAudioFileSection: UploadAudioFileSection = new UploadAudioFileSection();
let startParseSection: StartParseSection = new StartParseSection();
let loadAudioFileButton: LoadAudioFileSection = new LoadAudioFileSection();
let selectModeSection: SelectModeSection = new SelectModeSection();
let finishParseSection: FinishParseSection = new FinishParseSection();
let graphicalDisplaySection: GraphicalDisplaySection = new GraphicalDisplaySection();
let gameplaySettingsSection: GameplaySettingsSection = new GameplaySettingsSection();
let keyBindingMenu: KeyBindingMenu = new KeyBindingMenu();
let playButton: PlayButton = new PlayButton();

export function disablePlayButton() {
    playButton.disable();
}

export function disableLoadAudioFileButton() {
    loadAudioFileButton.disable();
}

export function updateSimfileState(simfileState_: SimfileState, args: any = undefined) {
    switch(simfileState_) {
        case SimfileState.NO_SIMFILE:
            uploadSimfileSection.show();
            startParseSection.hide();
            selectModeSection.hide();
            finishParseSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.hide();
            break;
        case SimfileState.SIMFILE_UPLOADED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.hide();
            finishParseSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.hide();
            break;
        case SimfileState.SIMFILE_PREPARSED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.show(<Mode[]> args);
            finishParseSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.hide();
            break;
        case SimfileState.DIFFICULTY_SELECTED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.show(<Mode[]> args);
            finishParseSection.show();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.hide();
            break;
        case SimfileState.SIMFILE_PARSED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.show(null);
            finishParseSection.show();
            graphicalDisplaySection.show();
            gameplaySettingsSection.show();
            keyBindingMenu.show(<Note[][]> args);
            break;
    }
    simfileState = simfileState_;
    updateSharedUIState();
}

export function updateAudioFileState(audioFileState_: AudioFileState) {
    switch(audioFileState_) {
        case AudioFileState.NO_AUDIO_FILE:
            uploadAudioFileSection.show();
            loadAudioFileButton.hide();
            break;
        case AudioFileState.AUDIO_FILE_UPLOADED:
            uploadAudioFileSection.show();
            loadAudioFileButton.show();
            break;
        case AudioFileState.AUDIO_FILE_LOADED:
            uploadAudioFileSection.show();
            loadAudioFileButton.show();
            loadAudioFileButton.disable();
            break;
    }
    audioFileState = audioFileState_;
    updateSharedUIState();
}

function updateSharedUIState() {
    if(simfileState == SimfileState.SIMFILE_PARSED && audioFileState == AudioFileState.AUDIO_FILE_LOADED) {
        playButton.show();
    }
    else {
        playButton.hide()
    }
}
