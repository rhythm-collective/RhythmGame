import {ScrollDirection} from "../scripts/scroll_direction";
import {Accuracy} from "../scripts/accuracy_manager";
import {BiDirectionalMap} from "../scripts/bi_directional_map";
import {defaultIfUndefined} from "../scripts/util";
import {DEFAULT_CONFIG} from "../scripts/default_config";

// Essential config: scroll speed, scroll direction, game width/height, additional offset, pause at start
export class Config {
    pixelsPerSecond: number;
    receptorYPosition: number;
    scrollDirection: ScrollDirection;
    additionalOffsetInSeconds: number;
    accuracySettings: Accuracy[];
    pauseAtStartInSeconds: number;
    keyBindings: BiDirectionalMap<string, number> = new BiDirectionalMap<string, number>();
    gameAreaHeight: number;
    gameAreaWidth: number;
    noteSize: number;

    constructor(args: {
                    pixelsPerSecond?: number,
                    receptorYPosition?: number,
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

        this.pixelsPerSecond = defaultIfUndefined(args.pixelsPerSecond, DEFAULT_CONFIG.pixelsPerSecond);
        // this.setSecondsPerPixel();

        this.scrollDirection = defaultIfUndefined(args.scrollDirection, DEFAULT_CONFIG.scrollDirection);
        // this.setScrollDirection();

        // NOTE: Scroll direction and gameAreaHeight must be set BEFORE setting receptorYPosition
        this.receptorYPosition = defaultIfUndefined(args.receptorYPosition, DEFAULT_CONFIG.receptorYPosition);
        // this.setReceptorYPosition();

        this.additionalOffsetInSeconds = defaultIfUndefined(args.additionalOffsetInSeconds, DEFAULT_CONFIG.additionalOffsetInSeconds);
        // this.setAdditionalOffsetInSeconds();

        this.accuracySettings = defaultIfUndefined(args.accuracySettings, DEFAULT_CONFIG.accuracySettings);
        // this.setAccuracySettings();

        this.pauseAtStartInSeconds = defaultIfUndefined(args.pauseAtStartInSeconds, DEFAULT_CONFIG.pauseAtStartInSeconds);
        // this.setPauseAtStartInSeconds();

        this.noteSize = defaultIfUndefined(args.noteSize, DEFAULT_CONFIG.noteSize);

        this.keyBindings = defaultIfUndefined(args.keyBindings, DEFAULT_CONFIG.keyBindings);
    }
}