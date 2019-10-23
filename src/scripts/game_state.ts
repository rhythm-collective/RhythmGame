import {stopAudio} from "./index";
import {Note} from "./note_manager";
import {config, noteManager} from "./playing_display";
import {Accuracy, accuracyManager} from "./gameplay";
import {ResultsManager, resultsManager} from "./results_manager";

export enum GameState {
    NOT_STARTED,
    PLAYING,
    RESULTS,
}

export class GameStateManager {
    currentState: GameState;
    private gameEndTime: number; // in seconds
    private audioDuration: number; // in seconds
    private notesEndTime: number; // in seconds
    private accuracyRecording: {time: number, accuracy: number}[][];

    constructor() {
        this.currentState = GameState.NOT_STARTED;
    }

    setAudioDuration(audioDuration: number) {
        this.audioDuration = audioDuration;
        this.audioDuration = 5;
        if(this.isAbleToCalculateGameEnd()) {
            this.calculateGameEnd();
        }
    }

    setNotesEndTime() {
        this.notesEndTime = noteManager.getLatestNote().time + config.getEarliestAccuracy() / 1000;
        if(this.isAbleToCalculateGameEnd()) {
            this.calculateGameEnd();
        }
    }

    isAbleToCalculateGameEnd(): boolean {
        return this.audioDuration != null && this.notesEndTime != null;
    }

    calculateGameEnd() {
        this.gameEndTime = Math.max(this.audioDuration, this.notesEndTime);
    }

    endSongIfSongIsOver(currentGameTime: number) {
        if(currentGameTime >= this.gameEndTime && this.currentState == GameState.PLAYING) {
            this.endSong();
        }
    }

    endSong() {
        stopAudio();
        console.log("Song Ended");
        this.currentState = GameState.RESULTS;
        resultsManager.initialize(this.accuracyRecording);
    }

    initializeAccuracyRecording(numTracks: number) {
        this.accuracyRecording = [];
        for(let i = 0; i < numTracks; i++) {
            this.accuracyRecording.push([]);
        }
    }

    saveAccuracy(trackNumber: number, accuracy: number, gameTime: number) { // accuracy is in milliseconds
        this.accuracyRecording[trackNumber].push({time: gameTime, accuracy: accuracy});
    }
}