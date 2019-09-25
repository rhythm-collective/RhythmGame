import {noteManager} from "./display";

export class Config {
    secondsPerPixel: number;
    receptorYPosition: number;

    constructor(secondsPerPixel: number, receptorYPosition: number) {
        this.secondsPerPixel = secondsPerPixel;
        this.receptorYPosition = receptorYPosition;
    }

    update() {
        let secondsPerPixel = this.getSecondsPerPixel();
        if(secondsPerPixel != null && secondsPerPixel != NaN) {
            noteManager.secondsPerPixel = secondsPerPixel;
            this.secondsPerPixel = secondsPerPixel;
        }

        let receptorYPosition = this.getReceptorYPosition();
        if(receptorYPosition != null && receptorYPosition != NaN) {
            for(let i = 0; i < noteManager.receptors.length; i++) {
                noteManager.receptors[i].y = receptorYPosition;
            }
            this.receptorYPosition = receptorYPosition;
        }
    }

    private getSecondsPerPixel(): number {
        return 1 / parseFloat((<HTMLInputElement>document.getElementById("scroll-speed")).value);
    }

    private getReceptorYPosition(): number {
        return parseFloat((<HTMLInputElement>document.getElementById("receptor-position")).value);
    }
}