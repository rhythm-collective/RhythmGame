import * as p5 from "p5";
import {Config} from "../scripts2/config";

let width = 720;
let height = 480;

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
                renderer.style('display', 'block');
                p.background(p.random(255));
                centerCanvas();
            };

            p.draw = function () {
                p.clear();
                SceneManager.draw();
            };

            p.windowResized = function () {
                centerCanvas();
            };
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
        let p: p5 = global.p5Scene.sketchInstance;
        p.push();
        p.textSize(20);
        let labelString = "label";
        p.text(labelString, 400, 150);
        // @ts-ignore
        let canvasPosition: { x: number, y: number } = p._renderer.position();
        let input = DOMWrapper.create(() => {
            return p.createInput(global.config.secondsPerPixel.toString());
        }, "secondsPerPixelInput").element;
        input.position(400 + p.textWidth(labelString) + canvasPosition.x, 150 + canvasPosition.y - 20);
        p.pop();
    }
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

function setCenterPositionRelative(element: p5.Element, relativeX: number, relativeY: number) {
    let p = global.p5Scene.sketchInstance;
    let canvasPosition: { x: number, y: number } = p._renderer.position();
    let elementSize: { width?: number, height?: number } = element.size();
    element.position(canvasPosition.x + (relativeX * p.width) - (elementSize.width / 2),
        canvasPosition.y + (relativeY * p.height) - (elementSize.height / 2));
}

abstract class DOMWrapper {
    private static registry: Map<string, p5.Element> = new Map();

    // uniqueID should be unique within a scene
    public static create(createCall: () => p5.Element, uniqueId: string) {
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

enum SCENES {
    SCENE_1,
    SCENE_2
}

const global: any = {};
global.p5Scene = new P5Scene();
global.config = new Config({});

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


