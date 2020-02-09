import * as p5 from "p5";

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
        let p: p5 = global.p5Scene.sketchInstance;
        let button = DOMWrapper.create(() => {return p.createButton("Click Me!")}, "button").element;
        setCenterPositionRelative(button, 0.5, 0.5);
        button.mousePressed(() => {
            p.background(p.random(255));
            console.log("Ding ding ding!");
        });
    }
}

function setCenterPositionRelative(element: p5.Element, relativeX: number, relativeY: number) {
    let p = global.p5Scene.sketchInstance;
    let canvasPosition: {x: number, y: number} = p._renderer.position();
    let elementSize: {width?: number, height?: number} = element.size();
    element.position(canvasPosition.x + (relativeX * p.width) - (elementSize.width / 2),
        canvasPosition.y + (relativeY * p.height) - (elementSize.height / 2));
}

abstract class DOMWrapper {
    private static registry: Map<string, p5.Element> = new Map();

    public static create(createCall: () => p5.Element, uniqueId: string) {
        if (this.registry.has(uniqueId)) {
            return {
                element: this.registry.get(uniqueId),
                alreadyExists: true
            };
        }
        else {
            let element = createCall();
            this.registry.set(uniqueId, element);
            return {
                element: element,
                alreadyExists: false
            };
        }
    }

    public static clearRegistry() {
        for (let key in this.registry) {
            this.registry.get(key).remove();
        }
        this.registry.clear();
    }
}

enum SCENES {
    SCENE_1
}

const global: any = {};
global.p5Scene = new P5Scene();

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
            default:
                throw new Error("Unexpected scene: " + global.currentScene);
        }
    }
}


