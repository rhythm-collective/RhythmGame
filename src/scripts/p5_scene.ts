import * as p5 from "p5";

const gameContainer: HTMLElement = document.getElementById("graphical-display-section");

export class P5Scene {
    canvas: HTMLCanvasElement;
    sketchInstance: p5;

    constructor(width: number, height: number,
                setupFunction: (canvas: HTMLCanvasElement, sketchInstance: p5) => void,
                drawFunction: () => void) {

        this.sketchInstance = new p5((p: p5) => {
            let renderer: p5.Renderer;

            function centerCanvas() {
                // let centerX = (p.windowWidth - p.width) / 2;
                // let centerY = (p.windowHeight - p.height) / 2;
                // renderer.position(centerX, centerY);
                renderer.center();
            }

            p.setup = function () {
                this.canvas = p.createCanvas(width, height).elt;
                setupFunction(this.canvas, p);
            };

            p.draw = drawFunction;

            p.windowResized = function () {
                centerCanvas();
            };

        }, gameContainer);
    }

    remove() {
        this.sketchInstance.remove();
    }
}