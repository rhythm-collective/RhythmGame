import * as p5 from "p5";
import {gameStateManager} from "./index";
import {GameState} from "./game_state";
import {gameplayTimeManager, missManager} from "./gameplay";
import {displayManager, scrollManager} from "./playing_display";
import {resultsManager} from "./results_manager";

export function displayRouterDraw(p: p5) {
    if (gameStateManager.currentState == GameState.PLAYING) {
        //let currentTime = scrollManager.getGameTime(); // Use this for debug mode
        let currentTime = gameplayTimeManager.getGameTime(performance.now());
        displayManager.setCurrentTime(currentTime);
        missManager.update(currentTime);
        displayManager.draw(); //TODO: make draw require game time as an argument
    }
    else if (gameStateManager.currentState == GameState.NOT_STARTED) {
        displayManager.setCurrentTime(scrollManager.getGameTime());
        displayManager.draw(); //TODO: make draw require game time as an argument
    }
    else if (gameStateManager.currentState == GameState.RESULTS) {
        resultsManager.draw(p);
    }
}