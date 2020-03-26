import {
    ActiveKeybindingState,
    BeginRebinding,
    ContinueRebinding,
    KeybindingFunction,
    SaveOnFinishFunction,
} from "./keybind_utility";

interface KeybindingAction {
    (bindingFunction: KeybindingFunction, saveOnFinishFunction: SaveOnFinishFunction): void;
}

function ActiveKeybindingAction(bindingFunction: KeybindingFunction, saveOnFinishFunction: SaveOnFinishFunction): void {
    if (!ContinueRebinding(activeKeybindingState, bindingFunction)) {
        saveOnFinishFunction(activeKeybindingState.bindings);
        ActiveKeybindingIterator = null;
        activeKeybindingState = null;
    }
}

export var ActiveKeybindingIterator: KeybindingAction = null;
var activeKeybindingState: ActiveKeybindingState = null;

export function StartRebindingSequence(bindingsToAcquire: number) {
    ActiveKeybindingIterator = ActiveKeybindingAction;
    activeKeybindingState = BeginRebinding(bindingsToAcquire);
}
