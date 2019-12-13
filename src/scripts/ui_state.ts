import {config, Mode} from "./index";

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

enum UiId {
    UPLOAD_SIMFILE_SECTION = "upload-simfile-section",
    UPLOAD_AUDIO_FILE_SECTION= "upload-audio-file-section",
    SELECT_MODE_SECTION = "select-mode-section",
    GRAPHICAL_DISPLAY_SECTION = "graphical-display-section",
    GAMEPLAY_SETTINGS_SECTION = "gameplay-settings-section",
    KEY_BINDING_MENU = "key-binding-menu",
    PLAY_BUTTON = "play-button",
}

class UploadSimfileSection {
    show() {
        document.getElementById(UiId.UPLOAD_SIMFILE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UiId.UPLOAD_SIMFILE_SECTION).style.display = "none";
    }
}

class UploadAudioFileSection {
    show() {
        document.getElementById(UiId.UPLOAD_AUDIO_FILE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UiId.UPLOAD_AUDIO_FILE_SECTION).style.display = "none";
    }
}

class SelectModeSection {
    show(modeOptions: Mode[] | null) {
        if(modeOptions != null) {
            document.getElementById(UiId.SELECT_MODE_SECTION).innerHTML = this.get(modeOptions);
        }
        document.getElementById(UiId.SELECT_MODE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UiId.SELECT_MODE_SECTION).style.display = "none";
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

class GraphicalDisplaySection {
    show() {
        document.getElementById(UiId.GRAPHICAL_DISPLAY_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UiId.GRAPHICAL_DISPLAY_SECTION).style.display = "none";
    }
}

class GameplaySettingsSection {
    show() {
        document.getElementById(UiId.GAMEPLAY_SETTINGS_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UiId.GAMEPLAY_SETTINGS_SECTION).style.display = "none";
    }
}

// TODO: provide config as an argument to a constructor
class KeyBindingMenu {
    currentNumTracks: number = 4;

    show(numTracks = this.currentNumTracks) {
        document.getElementById(UiId.KEY_BINDING_MENU).innerHTML =
            this.getKeyBindingMenu(numTracks) + '<br>';
        document.getElementById(UiId.KEY_BINDING_MENU).style.display = "";
        this.currentNumTracks = numTracks;
    }

    getKeyBindingMenu(numTracks: number): string {
        let keyBindingOptions: string = "";
        for(let i = 0; i < numTracks; i++) {
            keyBindingOptions += '<span class="key-binding-option">' +
                '<input type="button" value="Key #' + (i + 1) + '" onclick="simparser.bindingClicked(' + i + ')">' +
                '<input disabled type="text" size="10"' + this.getCurrentBinding(i) + 'style="margin: 0px 20px 0px 5px;" id="key-binding-field-' + i + '">' +
                '</span>';
        }
        return keyBindingOptions;
    }

    getCurrentBinding(trackNumber: number) {
        let key = config.keyBindings.getKey(trackNumber);
        return key == null ? '' : 'value="' + key.toUpperCase() + '"';
    }

    hide() {
        document.getElementById(UiId.KEY_BINDING_MENU).style.display = "none";
    }
}

class PlayButton {
    show() {
        document.getElementById(UiId.PLAY_BUTTON).style.display = "";
        (<HTMLInputElement>document.getElementById(UiId.PLAY_BUTTON)).disabled = false;
    }

    hide() {
        document.getElementById(UiId.PLAY_BUTTON).style.display = "none";
    }

    disable() {
        (<HTMLInputElement>document.getElementById(UiId.PLAY_BUTTON)).disabled = true;
    }
}

let uploadSimfileSection: UploadSimfileSection = new UploadSimfileSection();
let uploadAudioFileSection: UploadAudioFileSection = new UploadAudioFileSection();
let selectModeSection: SelectModeSection = new SelectModeSection();
let graphicalDisplaySection: GraphicalDisplaySection = new GraphicalDisplaySection();
let gameplaySettingsSection: GameplaySettingsSection = new GameplaySettingsSection();
export let keyBindingMenu: KeyBindingMenu = new KeyBindingMenu();
let playButton: PlayButton = new PlayButton();

export function disablePlayButton() {
    playButton.disable();
}

export function updateSimfileState(simfileState_: SimfileState, args: Mode[] | number = undefined) {
    switch(simfileState_) {
        case SimfileState.NO_SIMFILE:
            uploadSimfileSection.show();
            selectModeSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.show();
            break;
        case SimfileState.SIMFILE_UPLOADED:
            uploadSimfileSection.show();
            selectModeSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.show();
            break;
        case SimfileState.SIMFILE_PREPARSED:
            uploadSimfileSection.show();
            selectModeSection.show(<Mode[]> args);
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.show();
            break;
        case SimfileState.DIFFICULTY_SELECTED:
            uploadSimfileSection.show();
            selectModeSection.show(<Mode[]> args);
            graphicalDisplaySection.hide();
            gameplaySettingsSection.show();
            keyBindingMenu.show();
            break;
        case SimfileState.SIMFILE_PARSED:
            uploadSimfileSection.show();
            selectModeSection.show(null);
            graphicalDisplaySection.show();
            gameplaySettingsSection.show();
            keyBindingMenu.show(<number> args);
            break;
    }
    simfileState = simfileState_;
    updateSharedUIState();
}

export function updateAudioFileState(audioFileState_: AudioFileState) {
    switch(audioFileState_) {
        case AudioFileState.NO_AUDIO_FILE:
            uploadAudioFileSection.show();
            break;
        case AudioFileState.AUDIO_FILE_UPLOADED:
            uploadAudioFileSection.show();
            break;
        case AudioFileState.AUDIO_FILE_LOADED:
            uploadAudioFileSection.show();
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
