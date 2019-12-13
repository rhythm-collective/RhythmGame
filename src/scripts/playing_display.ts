import * as p5 from "p5";

import {P5Scene} from "./p5_scene";
import {DisplayManager} from "./display_manager";
import {NoteManager} from "./note_manager";
import {TimeManager} from "./time_manager";
import {MissManager} from "./miss_manager";
import {AccuracyManager} from "./accuracy_manager";
import {KeyHandler} from "./key_input_manager";
import {Config} from "./config";
import {ScrollManager} from "./scroll_manager";
import {ResultsDisplay} from "./results_display";
import {audioSource} from "./index";
import {playAudio, stopAudio} from "./file_util";
import {Note} from "./parsing";
import {HoldManager} from "./hold_manager";

export class PlayingDisplay {
    private scene: P5Scene;
    config: Config;
    noteManager: NoteManager;
    resultsDisplay: ResultsDisplay;
    private scrollManager: ScrollManager;
    private displayManager: DisplayManager;
    private timeManager: TimeManager | ScrollManager; // Uses ScrollManager only in debug mode
    private missManager: MissManager;
    private accuracyManager: AccuracyManager;
    private holdManager: HoldManager;
    private keyHandler: KeyHandler;
    private gameEndTime: number;
    private showResultsScreen: boolean;
    private accuracyRecording: { time: number; accuracy: number; }[][];
    private isDebugMode: boolean = false;

    constructor(tracks: Note[][], config: Config) {
        this.showResultsScreen = false;
        this.config = config;

        // initialize the time manager and play the audio as close together as possible to synchronize the audio
        // with the game
        this.timeManager = new TimeManager(performance.now(), this.config); //TODO: mess with this to make debug mode work again
        if (!this.isDebugMode) {
            window.setTimeout(playAudio, config.pauseAtStartInSeconds * 1000);
        }

        this.noteManager = new NoteManager(tracks);
        this.accuracyRecording = this.getInitialAccuracyRecording(this.noteManager.tracks.length);
        this.holdManager = new HoldManager(this.noteManager);

        if (this.isDebugMode) {
            this.scrollManager = new ScrollManager(this.config);
            this.timeManager = this.scrollManager; // this way the KeyHandler gets the right time in debug mode
        }

        this.gameEndTime = this.calculateGameEnd(audioSource.buffer.duration,
            this.noteManager.getLatestNote().timeInSeconds + config.getEarliestAccuracy() / 1000);
        this.accuracyManager = new AccuracyManager(this.noteManager, this.config, this.accuracyRecording, this.holdManager);
        this.missManager = new MissManager(this.config, this.noteManager, this.accuracyRecording, this.holdManager);
        this.keyHandler = new KeyHandler(this.config, this.timeManager, this.accuracyManager);
        document.addEventListener("keydown", this.keyHandler.keyDown.bind(this.keyHandler));
        document.addEventListener("keyup", this.keyHandler.keyUp.bind(this.keyHandler));

        this.scene = new P5Scene(this.config.gameAreaWidth, this.config.gameAreaHeight,
            (canvas: HTMLCanvasElement, p: p5) => {
                this.displayManager = new DisplayManager(this.noteManager, canvas, this.config, p);
                if (this.isDebugMode) {
                    canvas.addEventListener("wheel", (e: WheelEvent) => this.scrollManager.canvasScrolled(e));
                }
            },
            () => {
                let currentTimeInSeconds;
                if (this.isDebugMode) {
                    currentTimeInSeconds = this.scrollManager.getGameTime(); // Use this for debug mode
                } else {
                    currentTimeInSeconds = this.timeManager.getGameTime(performance.now());
                }
                if (currentTimeInSeconds >= this.gameEndTime && !this.showResultsScreen) {
                    this.resultsDisplay = new ResultsDisplay(this.config, this.noteManager, this.accuracyManager,
                        this.scene.sketchInstance, this.accuracyRecording);
                    this.endSong();
                    this.showResultsScreen = true;
                }
                if (this.showResultsScreen) {
                    this.resultsDisplay.draw();
                } else {
                    this.missManager.update(currentTimeInSeconds);
                    this.displayManager.draw(currentTimeInSeconds);
                }
            });
    }

    private calculateGameEnd(audioDuration: number, notesEndTime: number) {
        return Math.max(Math.min(notesEndTime + 5, audioDuration), notesEndTime);
    }

    private endSong() {
        stopAudio();
        console.log("Song Ended");
    }

    private getInitialAccuracyRecording(numTracks: number): { time: number, accuracy: number }[][] {
        let accuracyRecording = [];
        for (let i = 0; i < numTracks; i++) {
            accuracyRecording.push([]);
        }
        return accuracyRecording;
    }

    remove() {
        this.scene.remove();
        document.removeEventListener("keydown", this.keyHandler.keyDown);
        document.removeEventListener("keyup", this.keyHandler.keyUp);
    }
}