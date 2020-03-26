export interface Keybinding {
    key: number,
    binding: number
}

export interface KeybindingFunction {
    (currentBinding: number): Keybinding;
}

export interface SaveOnFinishFunction {
    (keybindings: Keybindings): void;
}

export type Keybindings = Keybinding[];

export interface ActiveKeybindingState {
    currentBinding: number;
    totalBindings: number;
    bindings?: Keybindings;
}

export function BeginRebinding(bindingsToAcquire: number): ActiveKeybindingState {
    var keybindingState: ActiveKeybindingState = {
        currentBinding: 0,
        totalBindings: bindingsToAcquire,
        bindings: []
    };

    return keybindingState;
}

export function ContinueRebinding(state: ActiveKeybindingState, bindingFunction: KeybindingFunction): boolean {
    console.debug("current:" + state.currentBinding);
    console.debug("totalBindings:" + state.totalBindings);
    
    if (state.currentBinding < state.totalBindings) {
        state.bindings.push(bindingFunction(state.currentBinding))
        state.currentBinding++;
    }

    return state.currentBinding < state.totalBindings;
}

export function GetKeybindings(state: ActiveKeybindingState): Keybindings {
    return state.bindings;
}
