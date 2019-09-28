import {noteManager} from "./display";

export enum ScrollDirection {
    UP,
    DOWN,
}

export enum ConfigOption {
    SECONDS_PER_PIXEL,
    RECEPTOR_Y_POSITION,
    SCROLL_DIRECTION,
    AUDIO_START_DELAY,
}

export class Config {
    secondsPerPixel: number;
    receptorYPosition: number;
    scrollDirection: ScrollDirection;
    additionalOffset: number;

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

    private getSecondsPerPixel(): number {
        return 1 / parseFloat((<HTMLInputElement>document.getElementById("scroll-speed")).value);
    }

    private getReceptorYPosition(): number {
        let receptorPositionPercentage = parseFloat(
            (<HTMLInputElement>document.getElementById("receptor-position")).value
        ) / 100;
        if (this.scrollDirection == ScrollDirection.UP) {
            return receptorPositionPercentage * noteManager.getCanvasHeight();
        }
        else {
            return (1 - receptorPositionPercentage) * noteManager.getCanvasHeight();
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
}