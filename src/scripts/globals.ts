import {PreviewDisplay} from "./preview_display";
import {PlayingDisplay} from "./playing_display";
import {Note} from "./parsing";

export class Globals {
    public static CURRENT_GAME_AREA: PreviewDisplay | PlayingDisplay;
    public static PARSED_NOTES: Note[][];
}