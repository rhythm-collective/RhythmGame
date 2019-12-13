import * as p5 from "p5";

import {DisplayManager} from "./display_manager";
import {NoteManager} from "./note_manager";
import {P5Scene} from "./p5_scene";
import {ScrollManager} from "./scroll_manager";
import {Config} from "./config";
import {Note} from "./parsing";

export class PreviewDisplay {
    private scene: P5Scene;
    config: Config;
    noteManager: NoteManager;
    private scrollManager: ScrollManager;
    private displayManager: DisplayManager;

    constructor(tracks: Note[][], config: Config) {
        this.config = config;
        this.noteManager = new NoteManager(tracks);
        this.scrollManager = new ScrollManager(this.config);
        this.scene = new P5Scene(this.config.gameAreaWidth, this.config.gameAreaHeight,
            (canvas: HTMLCanvasElement, p: p5) => {
                this.displayManager = new DisplayManager(this.noteManager, canvas, this.config, p);
                canvas.addEventListener("wheel", (e: WheelEvent) => this.scrollManager.canvasScrolled(e));
            }, () => {
                this.displayManager.draw(this.scrollManager.getGameTime());
            });
    }

    remove() {
        this.scene.remove();
    }
}