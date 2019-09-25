import {Mode} from "./index";
import {Note} from "./display";

export enum SimfileState {
    NO_SIMFILE,
    SIMFILE_UPLOADED,
    SIMFILE_PREPARSED,
    DIFFICULTY_SELECTED,
    SIMFILE_PARSED
}

enum UISectionID {
    UPLOAD_SIMFILE_SECTION = "upload-simfile-section",
    START_PARSE_SECTION = "start-parse-section",
    SELECT_MODE_SECTION = "select-mode-section",
    FINISH_PARSE_SECTION = "finish-parse-section",
    GRAPHICAL_DISPLAY_SECTION = "graphical-display-section",
    GAMEPLAY_SETTINGS_SECTION = "gameplay-settings-section",
    KEY_BINDING_MENU = "key-binding-menu",
}

class UploadSimfileSection {
    show() {
        document.getElementById(UISectionID.UPLOAD_SIMFILE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UISectionID.UPLOAD_SIMFILE_SECTION).style.display = "none";
    }
}

class StartParseSection {
    show() {
        document.getElementById(UISectionID.START_PARSE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UISectionID.START_PARSE_SECTION).style.display = "none";
    }
}

class SelectModeSection {
    show(modeOptions: Mode[] | null) {
        if(modeOptions != null) {
            document.getElementById(UISectionID.SELECT_MODE_SECTION).innerHTML = this.get(modeOptions);
        }
        document.getElementById(UISectionID.SELECT_MODE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UISectionID.SELECT_MODE_SECTION).style.display = "none";
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
        document.getElementById(UISectionID.FINISH_PARSE_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UISectionID.FINISH_PARSE_SECTION).style.display = "none";
    }
}

class GraphicalDisplaySection {
    show() {
        document.getElementById(UISectionID.GRAPHICAL_DISPLAY_SECTION).style.display = "";
    }

    hide() {
        document.getElementById(UISectionID.GRAPHICAL_DISPLAY_SECTION).style.display = "none";
    }
}

class GameplaySettingsSection {
    show(tracks: Note[][] | null) {
        if(tracks != null) {
            document.getElementById(UISectionID.KEY_BINDING_MENU).innerHTML =
                this.getKeyBindingMenu(tracks.length) + '<br>';
        }
        document.getElementById(UISectionID.GAMEPLAY_SETTINGS_SECTION).style.display = "";
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
        document.getElementById(UISectionID.GAMEPLAY_SETTINGS_SECTION).style.display = "none";
    }
}

let uploadSimfileSection: UploadSimfileSection = new UploadSimfileSection();
let startParseSection: StartParseSection = new StartParseSection();
let selectModeSection: SelectModeSection = new SelectModeSection();
let finishParseSection: FinishParseSection = new FinishParseSection();
let graphicalDisplaySection: GraphicalDisplaySection = new GraphicalDisplaySection();
let gameplaySettingsSection: GameplaySettingsSection = new GameplaySettingsSection();

export function setUIState(simfile_state: SimfileState, args: any = undefined) {
    switch(simfile_state) {
        case SimfileState.NO_SIMFILE:
            uploadSimfileSection.show();
            startParseSection.hide();
            selectModeSection.hide();
            finishParseSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.hide();
            break;
        case SimfileState.SIMFILE_UPLOADED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.hide();
            finishParseSection.hide();
            graphicalDisplaySection.hide();
            gameplaySettingsSection.hide();
            break;
        case SimfileState.SIMFILE_PREPARSED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.show(<Mode[]> args);
            finishParseSection.hide()
            graphicalDisplaySection.hide();
            gameplaySettingsSection.hide();
            break;
        case SimfileState.DIFFICULTY_SELECTED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.show(<Mode[]> args);
            finishParseSection.show()
            graphicalDisplaySection.hide();
            gameplaySettingsSection.hide();
            break;
        case SimfileState.SIMFILE_PARSED:
            uploadSimfileSection.show();
            startParseSection.show();
            selectModeSection.show(null);
            finishParseSection.show()
            graphicalDisplaySection.show();
            gameplaySettingsSection.show(<Note[][]> args);
            break;
    }
}