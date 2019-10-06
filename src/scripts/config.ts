import {displayManager} from "./display";
import {Accuracy} from "./gameplay";

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
}

export class Config {
    secondsPerPixel: number;
    receptorYPosition: number;
    scrollDirection: ScrollDirection;
    additionalOffset: number;
    accuracySettings: Accuracy[];

    constructor(secondsPerPixel: number, receptorYPosition: number, scrollDirection: ScrollDirection,
                additionalOffset: number) {
        this.secondsPerPixel = secondsPerPixel;
        this.receptorYPosition = receptorYPosition;
        this.scrollDirection = scrollDirection;
        this.additionalOffset = additionalOffset;
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
        if(additionalOffset != null && additionalOffset != NaN) {
            this.additionalOffset = additionalOffset
        }
    }

    updateAccuracySettings() {
        this.accuracySettings = this.getAccuracySettings();
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
}