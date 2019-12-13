import * as p5 from "p5";

const gameContainer: HTMLElement = document.getElementById("graphical-display-section");

export class P5Scene {
    canvas: HTMLCanvasElement;
    sketchInstance: p5;

    constructor(width: number, height: number,
                setupFunction: (canvas: HTMLCanvasElement, sketchInstance: p5) => void,
                drawFunction: () => void) {

        this.sketchInstance = new p5((p: p5) => {

            p.setup = function () {
                this.canvas = p.createCanvas(width, height).elt;
                setupFunction(this.canvas, p);
            };

            p.draw = drawFunction;

        }, gameContainer);
    }

    remove() {
        this.sketchInstance.remove();
    }
}