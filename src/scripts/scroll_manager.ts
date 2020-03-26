import {TimeManager} from "./time_manager";
import {Config} from "../scripts/config";

export class ScrollManager {
    private config: Config;
    private systemTime: number;
    private timeManager: TimeManager;

    constructor(config: Config) {
        this.config = config;
        this.systemTime = 0;
        this.timeManager = new TimeManager(0, this.config);
    }

    canvasScrolled(e: WheelEvent) {
        let timeChange = e.deltaY * this.config.pixelsPerSecond * 1000;
        this.systemTime += timeChange;
    }

    // Allow an ignored argument so it can be used in place of a TimeManager for debug mode
    getGameTime(ignoredArgument?: any) {
        return this.timeManager.getGameTime(this.systemTime);
    }
}
