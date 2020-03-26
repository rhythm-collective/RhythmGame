import {Config} from "../scripts/config";

export class TimeManager {
    systemTimeWhenGameStarted: number;
    private config: Config;

    constructor(systemTimeWhenGameStarted: number, config: Config) {
        this.systemTimeWhenGameStarted = systemTimeWhenGameStarted;
        this.config = config;
    }

    private getElapsedTime(systemTime: number): number {
        return (systemTime - this.systemTimeWhenGameStarted) / 1000; // in seconds
    }

    getGameTime(systemTime: number) {
        return this.getElapsedTime(systemTime) + this.config.additionalOffsetInSeconds - this.config.pauseAtStartInSeconds;
    }
}
