import {keyBindingMenu} from "./ui_state";
import {Config} from "./config";

// TODO: Add event listeners directly to the HTML elements
export class KeyBindingManager {
    private config: Config;
    expectingKeyInput: boolean = false;
    receivingIndex: number;

    constructor(config: Config) {
        this.config = config;
    }

    keyDown(e: KeyboardEvent) {
        if(this.expectingKeyInput) {
            let key: string = e.key.toUpperCase();
            this.getDisplayElement(this.receivingIndex).value = key;
            let previousBind = this.config.keyBindings.getKey(this.receivingIndex);
            if(previousBind != null) {
                this.config.keyBindings.deleteKey(previousBind);
            }
            this.config.keyBindings.set(key, this.receivingIndex);
            this.expectingKeyInput = false;
            this.updateAllBindingsDisplay();
        }
    }

    updateAllBindingsDisplay() {
        for(let i = 0; i < keyBindingMenu.currentNumTracks; i++) {
            let display = this.getDisplayElement(i);
            if(display != null) {
                display.value = this.config.keyBindings.getKey(i);
            }
        }
    }

    private getDisplayElement(trackNumber: number) {
        return <HTMLInputElement>document.getElementById("key-binding-field-" + trackNumber);
    }
}