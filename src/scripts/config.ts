import {displayManager, noteManager} from "./display";
import {Accuracy, TimeManager} from "./gameplay";

export enum ScrollDirection {
    UP,
    DOWN,
}

export enum ConfigOption {
    SECONDS_PER_PIXEL,
    RECEPTOR_Y_POSITION,
    SCROLL_DIRECTION,
    AUDIO_START_DELAY,
    ACCURACY_SETTINGS,
    PAUSE_AT_START,
}

export class Config {
    secondsPerPixel: number;
    receptorYPosition: number;
    scrollDirection: ScrollDirection;
    additionalOffset: number; // in seconds
    accuracySettings: Accuracy[];
    pauseAtStart: number; // in seconds

    constructor(secondsPerPixel: number, receptorYPosition: number, scrollDirection: ScrollDirection,
                additionalOffset: number, pauseAtStart: number) {
        this.secondsPerPixel = secondsPerPixel;
        this.receptorYPosition = receptorYPosition;
        this.scrollDirection = scrollDirection;
        this.additionalOffset = additionalOffset;
        this.pauseAtStart = pauseAtStart;
    }

    updateSecondsPerPixel() {
        let secondsPerPixel: number = this.getSecondsPerPixel();
        if (secondsPerPixel != null && secondsPerPixel != NaN) {
            this.secondsPerPixel = secondsPerPixel;
        }
    }

    updateReceptorYPosition() {
        let receptorYPosition: number = this.getReceptorYPosition();
        if (receptorYPosition != null && receptorYPosition != NaN) {
            this.receptorYPosition = receptorYPosition;
        }
    }

    updateScrollDirection() {
        let scrollDirection: ScrollDirection = this.getScrollDirection();
        if(scrollDirection != null) {
            this.scrollDirection = scrollDirection;
            this.updateReceptorYPosition();
        }
    }

    updateAudioStartDelay() {
        let additionalOffset: number = this.getAdditionalOffset();
        if(additionalOffset != null && additionalOffset != NaN && additionalOffset >= 0) {
            this.additionalOffset = additionalOffset;
        }
    }

    updateAccuracySettings() {
        let accuracySettings: Accuracy[] = this.getAccuracySettings();
        if(accuracySettings != null) {
            this.accuracySettings = accuracySettings;
        }
    }

    updatePauseAtStart() {
        let pauseAtStart: number = this.getPauseAtStart();
        if(pauseAtStart != null && pauseAtStart != NaN) {
            this.pauseAtStart = pauseAtStart;
        }
    }

    private getSecondsPerPixel(): number {
        return 1 / parseFloat((<HTMLInputElement>document.getElementById("scroll-speed")).value);
    }

    private getReceptorYPosition(): number {
        let receptorPositionPercentage = parseFloat(
            (<HTMLInputElement>document.getElementById("receptor-position")).value
        ) / 100;
        if (this.scrollDirection == ScrollDirection.UP) {
            return receptorPositionPercentage * displayManager.getCanvasHeight();
        }
        else {
            return (1 - receptorPositionPercentage) * displayManager.getCanvasHeight();
        }
    }

    private getScrollDirection(): ScrollDirection {
        return ScrollDirection[(
                <HTMLInputElement>document.getElementById("scroll-direction")
            ).value as keyof typeof ScrollDirection
        ];
    }

    private getAdditionalOffset(): number {
        return parseFloat((<HTMLInputElement>document.getElementById("audio-start-delay")).value) / 1000;
    }

    private getAccuracySettings(): Accuracy[] {
        let array: Accuracy[] = JSON.parse((<HTMLInputElement>document.getElementById("accuracy-settings")).value);
        let accuracySettings: Accuracy[] = [];
        for(let i = 0; i < array.length; i++) { // this validates whether the user gave the right input
            let object = array[i];
            accuracySettings.push(new Accuracy(object.name, object.lowerBound, object.upperBound));
        }
        return accuracySettings;
    }

    private getPauseAtStart(): number {
        return parseFloat((<HTMLInputElement>document.getElementById("pause-at-start")).value) / 1000;
    }

    public setPauseAtStartToDefault(): void {
        let timeFromReceptorToScreenEdge: number = this.getTimeFromReceptorToScreenEdge();
        let minimumPauseAtStart: number = Math.max(timeFromReceptorToScreenEdge,
            this.getEarliestAccuracy() / 1000);
        let currentNaturalPauseAtStart: number = noteManager.getEarliestNote().time - this.getInitalGameTime();
        let defaultPauseAtStart = Math.max(0, minimumPauseAtStart - currentNaturalPauseAtStart) * 1000;
        (<HTMLInputElement>document.getElementById("pause-at-start")).value =
            Math.round(defaultPauseAtStart).toString();
        this.updatePauseAtStart();
    }

    private getTimeFromReceptorToScreenEdge(): number {
        if(this.scrollDirection == ScrollDirection.UP) {
            return (displayManager.getCanvasHeight() - this.receptorYPosition) * this.secondsPerPixel;
        }
        else {
            return this.receptorYPosition * this.secondsPerPixel;
        }
    }

    private getEarliestAccuracy(): number {
        if (this.accuracySettings[this.accuracySettings.length - 1].upperBound != null) {
            return this.accuracySettings[this.accuracySettings.length - 1].upperBound;
        } else {
            return this.accuracySettings[this.accuracySettings.length - 2].upperBound;
        }
    }

    private getInitalGameTime(): number {
        return new TimeManager(0).getGameTime(0) + this.getPauseAtStart();
    }
}