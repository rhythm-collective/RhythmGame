import * as p5 from "p5";
import {Config} from "../scripts2/config";
import {PreviewDisplay} from "../scripts/preview_display";
import {NoteState, NoteType} from "../scripts/parsing";
import {KeyboardEventManager} from "./keyboard_event_manager";
import {ScrollDirection} from "../scripts/scroll_direction";
import {Keybinding, Keybindings, KeybindingFunction, SaveOnFinishFunction} from "./keybind_utility"
import * as KeybindingHelper from "./keybinding_helper";

let width = 720;
let height = 480;

enum SCENES {
    SCENE_1,
    SCENE_2
}

abstract class SceneManager {
    private static currentScene: SCENES = SCENES.SCENE_1;

    public static getCurrentScene() {
        return this.currentScene;
    }

    public static setCurrentScene(scene: SCENES) {
        this.currentScene = scene;
        DOMWrapper.clearRegistry();
    }

    public static draw() {
        switch (this.currentScene) {
            case SCENES.SCENE_1:
                Scene1.draw();
                break;
            case SCENES.SCENE_2:
                Scene2.draw();
                break;
            default:
                throw new Error("Unexpected scene: " + global.currentScene);
        }
    }
}

class P5Scene {
    sketchInstance: p5;

    constructor() {
        this.sketchInstance = new p5((p: p5) => {
            let renderer: p5.Renderer;

            function centerCanvas() {
                renderer.center();
            }

            p.setup = function () {
                renderer = p.createCanvas(width, height);
                global.keyboardEventManager = new KeyboardEventManager(p);
                global.keyboardEventManager.bindKeyToAction(65, () => {
                    console.log("A down");
                });
                global.previewDisplay = new PreviewDisplay(global.previewNotes, global.config, global.p5Scene);
                renderer.style('display', 'block'); // Makes the canvas be able to fill the whole browser window
                centerCanvas();
                console.log("Setup complete");
            };

            p.draw = function () {
                p.clear();
                p.background(200);
                SceneManager.draw();
            };

            p.windowResized = function () {
                centerCanvas();
            };

            p.keyTyped = function () {
                if (KeybindingHelper.ActiveKeybindingIterator != null) {
                    var bind: KeybindingFunction = (currentBinding: number) => {
                        var keybinding: Keybinding = { key: p.keyCode, binding: currentBinding };
                        return keybinding;
                    };

                    var writeOut: SaveOnFinishFunction = (bindings: Keybindings) => {
                        p.print(bindings);
                    };

                    KeybindingHelper.ActiveKeybindingIterator(bind, writeOut);
                }
            }
        });
    }
}

abstract class Scene1 {
    public static draw() {
        drawHeading();
        let p: p5 = global.p5Scene.sketchInstance;
        let button = DOMWrapper.create(() => {
            return p.createButton("Click Me!");
        }, "button").element;
        setCenterPositionRelative(button, 0.5, 0.5);
        button.mousePressed(() => {
            p.background(p.random(255));
        });
    }
}

abstract class Scene2 {
    public static draw() {
        drawHeading();

        let pauseAtStartInSecondsInput = createLabelledInput("Pause at Start (sec)", "pauseAtStartInSecondsInput",
            global.config.pauseAtStartInSeconds.toString(), 15, 400, 90);
        // @ts-ignore
        pauseAtStartInSecondsInput.input(() => {
            let value: string | number = pauseAtStartInSecondsInput.value();
            if (typeof value === "string") {
                value = parseFloat(value);
            }
            if (!isNaN(value) && value >= 0) {
                global.config.pauseAtStartInSeconds = value;
            }
        });

        let scrollSpeedInput = createLabelledInput("Scroll Speed (px/sec)", "scrollSpeedInput",
            global.config.pixelsPerSecond.toString(), 15, 400, 120);
        // @ts-ignore
        scrollSpeedInput.input(() => {
            let value: string | number = scrollSpeedInput.value();
            if (typeof value === "string") {
                value = parseFloat(value);
            }
            if (!isNaN(value) && value > 0) {
                global.config.pixelsPerSecond = value;
            }
        });

        let scrollDirectionSelect = createLabelledSelect("Scroll Direction", "scrollDirectionSelect",
            ScrollDirection, global.config.scrollDirection, 15, 400, 150);
        // @ts-ignore
        scrollDirectionSelect.changed(() => {
            let value: string = String(scrollDirectionSelect.value());
            let enumOfValue = ScrollDirection[value as keyof typeof ScrollDirection];
            if (enumOfValue !== undefined) {
                global.config.scrollDirection = enumOfValue;
            }
        });

        let receptorPositionInput = createLabelledInput("Receptor Position (%)", "receptorPositionInput",
            global.config.receptorYPercent.toString(), 15, 400, 180);
        // @ts-ignore
        receptorPositionInput.input(() => {
            let value: string | number = receptorPositionInput.value();
            if (typeof value === "string") {
                value = parseFloat(value);
            }
            if (!isNaN(value)) {
                global.config.receptorYPercent = value;
            }
        });

        let additionalOffsetInSecondsInput = createLabelledInput("Accuracy Offset (sec)", "additionalOffsetInSecondsInput",
            global.config.additionalOffsetInSeconds.toString(), 15, 400, 210);
        // @ts-ignore
        additionalOffsetInSecondsInput.input(() => {
            let value: string | number = additionalOffsetInSecondsInput.value();
            if (typeof value === "string") {
                value = parseFloat(value);
            }
            if (!isNaN(value) && value > 0) {
                global.config.additionalOffsetInSeconds = value;
            }
        });

        let keyBinding0 = createKeyBindingInput(0, "track0Binding",15, 400, 240);
        let keyBinding1 = createKeyBindingInput(1, "track1Binding",15, 400, 270);
        let keyBinding2 = createKeyBindingInput(2, "track2Binding",15, 400, 300);
        let keyBinding3 = createKeyBindingInput(3, "track3Binding",15, 400, 330);

        DrawQuickStartKeybindingsButton();
        global.previewDisplay.draw();
    }
}

function enumToStringArray(e: any): string[] {
    return Object.values(e).filter((value) => typeof value === "string").map((value) => {
        return String(value)
    });
}

function createLabelledInput(labelString: string, uniqueId: string, initialValue: string, labelFontSize: number,
                             labelX: number, labelY: number) {
    let p: p5 = global.p5Scene.sketchInstance;
    p.push();
    p.textSize(labelFontSize);
    p.text(labelString, labelX, labelY);
    // @ts-ignore
    let canvasPosition: { x: number, y: number } = p._renderer.position();
    let input = DOMWrapper.create(() => {
        return p.createInput(initialValue);
    }, uniqueId).element;

    let inputFontSize = labelFontSize * 0.9;
    let inputRelativeLength = 8.0;
    let relativeSpacing = 1.0;
    input.style("font-size", inputFontSize + "px");
    input.size(inputRelativeLength * inputFontSize);
    let inputSize: { width?: number, height?: number } = input.size();
    input.position(canvasPosition.x + labelX + p.textWidth(labelString) + relativeSpacing * labelFontSize,
        canvasPosition.y + labelY - (inputSize.height / 2) - (p.textAscent() * 0.35));
    p.pop();
    return input;
}

// TODO: check that optionsEnum is actually an Enum, and initialEnumValue is a value for that enum
function createLabelledSelect(labelString: string, uniqueId: string, optionsEnum: any, initialEnumValue: any,
                              labelFontSize: number, labelX: number, labelY: number) {
    let p: p5 = global.p5Scene.sketchInstance;
    p.push();
    p.textSize(labelFontSize);
    p.text(labelString, labelX, labelY);
    // @ts-ignore
    let canvasPosition: { x: number, y: number } = p._renderer.position();
    let createResult = DOMWrapper.create(() => {
        return p.createSelect();
    }, uniqueId);
    let select = createResult.element;
    if (!createResult.alreadyExists) {
        let initialOptions = enumToStringArray(optionsEnum);
        for (let i = 0; i < initialOptions.length; i++) {
            // @ts-ignore
            select.option(initialOptions[i]);
        }
        // @ts-ignore
        select.selected(ScrollDirection[initialEnumValue as keyof typeof ScrollDirection].toString());
    }

    let inputFontSize = labelFontSize * 0.9;
    let inputRelativeLength = 8.0;
    let relativeSpacing = 1.0;
    select.style("font-size", inputFontSize + "px");
    select.size(inputRelativeLength * inputFontSize);
    let inputSize: { width?: number, height?: number } = select.size();
    select.position(canvasPosition.x + labelX + p.textWidth(labelString) + relativeSpacing * labelFontSize,
        canvasPosition.y + labelY - (inputSize.height / 2) - (p.textAscent() * 0.35));
    p.pop();
    return select;
}

function createKeyBindingInput(trackNumber: number, uniqueId: string, labelFontSize: number, labelX: number, labelY: number) {
    let p: p5 = global.p5Scene.sketchInstance;
    p.push();
    p.textSize(labelFontSize);
    let labelString = "Track " + (trackNumber + 1);
    if (trackNumber == 0) {
        labelString += " (Leftmost)";
    }
    labelString += ":";
    p.text(labelString, labelX, labelY);

    let keyString = "LShift";
    let labelToKeyRelativeSpacing = 1.0;
    let keyStringX = labelX + p.textWidth(labelString) + labelToKeyRelativeSpacing * labelFontSize;
    p.text(keyString, keyStringX, labelY);

    // @ts-ignore
    let canvasPosition: { x: number, y: number } = p._renderer.position();
    let button = DOMWrapper.create(() => {
        return p.createButton("Set");
    }, uniqueId + "Button").element;

    button.mousePressed(() => {
        console.log("Hello World!");
    });

    let inputFontSize = labelFontSize * 0.9;
    let inputRelativeLength = 3.3;
    let relativeSpacing = 1.0;
    button.style("font-size", inputFontSize + "px");
    button.size(inputRelativeLength * inputFontSize);
    let inputSize: { width?: number, height?: number } = button.size();
    let minimumKeyStringSpace = p.textWidth("LShift");
    let inputX = canvasPosition.x + keyStringX + Math.max(minimumKeyStringSpace, p.textWidth(keyString)) + relativeSpacing * labelFontSize;
    let inputY = canvasPosition.y + labelY - (inputSize.height / 2) - (p.textAscent() * 0.35);
    button.position(inputX, inputY);
    p.pop();
    return button;
}

function drawHeading() {
    let p: p5 = global.p5Scene.sketchInstance;

    let scene1Button = DOMWrapper.create(() => {
        return p.createButton("Play From File");
    }, "scene1Button").element;
    setCenterPositionRelative(scene1Button, 0.3, 0.05);
    scene1Button.mousePressed(() => {
        SceneManager.setCurrentScene(SCENES.SCENE_1);
    });

    let scene2Button = DOMWrapper.create(() => {
        return p.createButton("Options");
    }, "scene2Button").element;
    setCenterPositionRelative(scene2Button, 0.7, 0.05);
    scene2Button.mousePressed(() => {
        SceneManager.setCurrentScene(SCENES.SCENE_2);
    });
}

// Expects relativeX and relative Y to be between 0 and 1
function setCenterPositionRelative(element: p5.Element, relativeX: number, relativeY: number) {
    let p = global.p5Scene.sketchInstance;
    let canvasPosition: { x: number, y: number } = p._renderer.position();
    let elementSize: { width?: number, height?: number } = element.size();
    element.position(canvasPosition.x + (relativeX * p.width) - (elementSize.width / 2),
        canvasPosition.y + (relativeY * p.height) - (elementSize.height / 2));
}

// Lets us code the DOM UI elements as if it were "immediate", i.e. stateless
abstract class DOMWrapper {
    private static registry: Map<string, p5.Element> = new Map();

    // uniqueID should be unique within a scene
    public static create(createCall: () => p5.Element, uniqueId: string): { element: p5.Element, alreadyExists: boolean } {
        if (this.registry.has(uniqueId)) {
            return {
                element: this.registry.get(uniqueId),
                alreadyExists: true
            };
        } else {
            let element = createCall();
            this.registry.set(uniqueId, element);
            return {
                element: element,
                alreadyExists: false
            };
        }
    }

    public static clearRegistry() {
        this.registry.forEach((value, key, map) => {
            value.remove();
        });
        this.registry.clear();
    }
}


const global: any = {};
global.p5Scene = new P5Scene();
global.config = new Config({});
global.previewNotes = [
    [{type: NoteType.NORMAL, timeInSeconds: 0.1, state: NoteState.DEFAULT}, {
        type: NoteType.NONE,
        timeInSeconds: 0.35,
        state: NoteState.DEFAULT
    }],
    [{type: NoteType.HOLD_HEAD, timeInSeconds: 0.2, state: NoteState.DEFAULT}, {
        type: NoteType.TAIL,
        timeInSeconds: 0.5,
        state: NoteState.DEFAULT
    }],
    [{type: NoteType.MINE, timeInSeconds: 0.3, state: NoteState.DEFAULT}],
    [{type: NoteType.ROLL_HEAD, timeInSeconds: 0.4, state: NoteState.DEFAULT}, {
        type: NoteType.TAIL,
        timeInSeconds: 0.55,
        state: NoteState.DEFAULT
    }]
];

function DrawQuickStartKeybindingsButton()
{
    let p: p5 = global.p5Scene.sketchInstance;
    let button = DOMWrapper.create(() => {
        return p.createButton("KeyBindings Quickstart");
    }, "button").element;
    setCenterPositionRelative(button, 0.5, 0.5);
    button.mousePressed(() => {
        KeybindingHelper.StartRebindingSequence(4);
    });
}
