import {Accuracy} from "./accuracy_manager";
import {TimeManager} from "./time_manager";
import {BiDirectionalMap} from "./bi_directional_map";
import {DEFAULT_CONFIG} from "./default_config";
import {defaultIfUndefined} from "./util";
import {ScrollDirection} from "./scroll_direction";
import {NoteManager} from "./note_manager";

export enum ConfigOption {
    SECONDS_PER_PIXEL,
    RECEPTOR_Y_POSITION,
    SCROLL_DIRECTION,
    AUDIO_START_DELAY,
    ACCURACY_SETTINGS,
    PAUSE_AT_START,
}

//TODO: make scroll direction consistent with the visual scroll direction, i.e. scrolling up always makes the notes go up?
// But what about when scroll direction is controlled by an angle? Maybe I should just leave it how it is.
//TODO: use gameAreaHeight and width to determine the height and width of the game area
//TODO: update the UI to reflect what the default config contains
export class Config {
    pixelsPerSecond: number;
    receptorYPercent: number;
    scrollDirection: ScrollDirection;
    additionalOffsetInSeconds: number;
    accuracySettings: Accuracy[];
    pauseAtStartInSeconds: number;
    keyBindings: BiDirectionalMap<string, number> = new BiDirectionalMap<string, number>();
    gameAreaHeight: number;
    gameAreaWidth: number;
    noteSize: number;

    constructor(args: {
                    secondsPerPixel?: number,
                    receptorYPercent?: number,
                    scrollDirection?: ScrollDirection,
                    additionalOffsetInSeconds?: number,
                    accuracySettings?: Accuracy[],
                    pauseAtStartInSeconds?: number,
                    keyBindings?: BiDirectionalMap<string, number>,
                    gameAreaHeight?: number,
                    gameAreaWidth?: number,
                    noteSize?: number,
                }
    ) {
        this.gameAreaHeight = defaultIfUndefined(args.gameAreaHeight, DEFAULT_CONFIG.gameAreaHeight);
        this.gameAreaWidth = defaultIfUndefined(args.gameAreaWidth, DEFAULT_CONFIG.gameAreaWidth);

        this.pixelsPerSecond = defaultIfUndefined(args.secondsPerPixel, DEFAULT_CONFIG.pixelsPerSecond);
        this.setSecondsPerPixel();

        this.scrollDirection = defaultIfUndefined(args.scrollDirection, DEFAULT_CONFIG.scrollDirection);
        this.setScrollDirection();

        // NOTE: Scroll direction and gameAreaHeight must be set BEFORE setting receptorYPosition
        this.receptorYPercent = defaultIfUndefined(args.receptorYPercent, DEFAULT_CONFIG.receptorYPercent);
        this.setReceptorYPosition();

        this.additionalOffsetInSeconds = defaultIfUndefined(args.additionalOffsetInSeconds, DEFAULT_CONFIG.additionalOffsetInSeconds);
        this.setAdditionalOffsetInSeconds();

        this.accuracySettings = defaultIfUndefined(args.accuracySettings, DEFAULT_CONFIG.accuracySettings);
        this.setAccuracySettings();

        this.pauseAtStartInSeconds = defaultIfUndefined(args.pauseAtStartInSeconds, DEFAULT_CONFIG.pauseAtStartInSeconds);
        this.setPauseAtStartInSeconds();

        this.noteSize = defaultIfUndefined(args.noteSize, DEFAULT_CONFIG.noteSize);

        this.keyBindings = defaultIfUndefined(args.keyBindings, DEFAULT_CONFIG.keyBindings);
    }

    updateSecondsPerPixel() {
        let secondsPerPixel: number = this.getSecondsPerPixel();
        if (secondsPerPixel != null && secondsPerPixel != NaN) {
            this.pixelsPerSecond = secondsPerPixel;
        }
    }

    updateReceptorYPosition() {
        let receptorYPosition: number = this.getReceptorYPosition();
        if (receptorYPosition != null && receptorYPosition != NaN) {
            this.receptorYPercent = receptorYPosition;
        }
    }

    updateScrollDirection() {
        let scrollDirection: ScrollDirection = this.getScrollDirection();
        if (scrollDirection != null) {
            this.scrollDirection = scrollDirection;
            this.updateReceptorYPosition();
        }
    }

    updateAudioStartDelay() {
        let additionalOffset: number = this.getAdditionalOffsetInSeconds();
        if (additionalOffset != null && additionalOffset != NaN) {
            this.additionalOffsetInSeconds = additionalOffset;
        }
    }

    updateAccuracySettings() {
        let accuracySettings: Accuracy[] = this.getAccuracySettings();
        if (accuracySettings != null) {
            this.accuracySettings = accuracySettings;
        }
    }

    updatePauseAtStart() {
        let pauseAtStart: number = this.getPauseAtStart();
        if (pauseAtStart != null && pauseAtStart != NaN) {
            this.pauseAtStartInSeconds = pauseAtStart;
        }
    }

    private getSecondsPerPixel(): number {
        return 1 / parseFloat((<HTMLInputElement>document.getElementById("scroll-speed")).value);
    }

    private setSecondsPerPixel() {
        (<HTMLInputElement>document.getElementById("scroll-speed")).value = (1 / this.pixelsPerSecond).toString();
    }

    private getReceptorYPosition(): number {
        let receptorPositionPercentage = parseFloat(
            (<HTMLInputElement>document.getElementById("receptor-position")).value
        ) / 100;
        if (this.scrollDirection == ScrollDirection.Up) {
            return receptorPositionPercentage * this.gameAreaHeight;
        } else {
            return (1 - receptorPositionPercentage) * this.gameAreaHeight;
        }
    }

    private setReceptorYPosition() {
        let receptorPositionPercentage;
        if (this.scrollDirection == ScrollDirection.Up) {
            receptorPositionPercentage = (this.receptorYPercent / this.gameAreaHeight) * 100;
        } else {
            receptorPositionPercentage = (1 - (this.receptorYPercent / this.gameAreaHeight)) * 100;
        }
        (<HTMLInputElement>document.getElementById("receptor-position")).value = Math.round(receptorPositionPercentage).toString();
    }

    private getScrollDirection(): ScrollDirection {
        return ScrollDirection[(
            <HTMLInputElement>document.getElementById("scroll-direction")
        ).value as keyof typeof ScrollDirection];
    }

    private setScrollDirection() {
        (<HTMLInputElement>document.getElementById("scroll-direction")).value = ScrollDirection[this.scrollDirection];
    }

    private getAdditionalOffsetInSeconds(): number {
        return parseFloat((<HTMLInputElement>document.getElementById("audio-start-delay")).value) / 1000;
    }

    private setAdditionalOffsetInSeconds() {
        (<HTMLInputElement>document.getElementById("audio-start-delay")).value = (this.additionalOffsetInSeconds * 1000).toString();
    }

    private getAccuracySettings(): Accuracy[] {
        let array: Accuracy[];
        try {
            array = JSON.parse((<HTMLInputElement>document.getElementById("accuracy-settings")).value);
        } catch (e) {
            return null;
        }
        let accuracySettings: Accuracy[] = [];
        for (let i = 0; i < array.length; i++) {
            let object = array[i];
            // this fails if the user gave the wrong input
            accuracySettings.push(new Accuracy(object.name, object.lowerBound, object.upperBound));
        }
        return accuracySettings;
    }

    private setAccuracySettings() {
        (<HTMLInputElement>document.getElementById("accuracy-settings")).value =
            JSON.stringify(this.accuracySettings, null, 3);
    }

    private getPauseAtStart(): number {
        return parseFloat((<HTMLInputElement>document.getElementById("pause-at-start")).value) / 1000;
    }

    private setPauseAtStartInSeconds() {
        (<HTMLInputElement>document.getElementById("pause-at-start")).value = (this.pauseAtStartInSeconds * 1000).toString();
    }

    public setPauseAtStartToDefault(noteManager: NoteManager): void {
        let timeFromReceptorToScreenEdge: number = this.getTimeFromReceptorToScreenEdge();
        let minimumPauseAtStart: number = Math.max(timeFromReceptorToScreenEdge,
            this.getEarliestAccuracy() / 1000);
        let currentNaturalPauseAtStart: number = noteManager.getEarliestNote().timeInSeconds - this.getInitalGameTime();
        let defaultPauseAtStart = Math.max(0, minimumPauseAtStart - currentNaturalPauseAtStart) * 1000;
        (<HTMLInputElement>document.getElementById("pause-at-start")).value =
            Math.round(defaultPauseAtStart).toString();
        this.updatePauseAtStart();
    }

    private getTimeFromReceptorToScreenEdge(): number {
        if (this.scrollDirection == ScrollDirection.Up) {
            return (this.gameAreaHeight - this.receptorYPercent) * this.pixelsPerSecond;
        } else {
            return this.receptorYPercent * this.pixelsPerSecond;
        }
    }

    getEarliestAccuracy(): number {
        if (this.accuracySettings[this.accuracySettings.length - 1].upperBound != null) {
            return this.accuracySettings[this.accuracySettings.length - 1].upperBound;
        } else {
            return this.accuracySettings[this.accuracySettings.length - 2].upperBound;
        }
    }

    private getInitalGameTime(): number {
        return new TimeManager(0, this).getGameTime(0) + this.getPauseAtStart();
    }
}
