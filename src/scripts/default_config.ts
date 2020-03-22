import {Accuracy} from "./accuracy_manager";
import {BiDirectionalMap} from "./bi_directional_map";
import {ScrollDirection} from "./scroll_direction";

export let DEFAULT_CONFIG = {
    pixelsPerSecond: 650,
    scrollDirection: ScrollDirection.Down,
    receptorYPosition: 400,
    additionalOffsetInSeconds: 0,
    // This is a symmetrical version of FFR's accuracy
    // TODO: Add a list of presets that live in their own file
    // TODO: validation on accuracy settings that explains why miss shouldn't have lower bound
    accuracySettings: [
        new Accuracy("Miss", null,-117),
        new Accuracy("Average", -117, -83),
        new Accuracy("Good", -83, -50),
        new Accuracy("Perfect", -50, -17),
        new Accuracy("Amazing", -17, 17),
        new Accuracy("Perfect", 17, 50),
        new Accuracy("Good", 50, 83),
        new Accuracy("Average", 83, 117),
        new Accuracy("Boo", 117, null)
    ],
    pauseAtStartInSeconds: 0,
    keyBindings: new BiDirectionalMap<string, number>({"E": 0, "F": 1, "K": 2, "O": 3}),
    gameAreaHeight: 600,
    gameAreaWidth: 400,
    noteSize: 20
};