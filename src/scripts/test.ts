import {compareModeOptions, Mode} from "./index";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
export function modeTest() {
    let modes: Mode[] = [
        {type: "dance-solo", difficulty: "Easy", meter: "4", id: 1},
        {type: "dance-single", difficulty: "Easy", meter: "5", id: 2},
        {type: "dance-solo", difficulty: "Hard", meter: "15", id: 3},
        {type: "dance-single", difficulty: "Hard", meter: "8", id: 4},
        {type: "dance-solo", difficulty: "Medium", meter: "8", id: 5},
        {type: "dance-single", difficulty: "Medium", meter: "6", id: 6},
        {type: "dance-solo", difficulty: "Edit", meter: "20", id: 7},
        {type: "dance-single", difficulty: "Challenge", meter: "12", id: 8}
    ];
    console.log(modes.sort(compareModeOptions));
}