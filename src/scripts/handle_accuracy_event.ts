import {saveAccuracy} from "./util";

//TODO: animations for accuracy events
export function handleAccuracyEvent(accuracyName: string, trackNumber: number, accuracy: number, currentTime: number,
                                    accuracyRecording: { time: number, accuracy: number }[][]) {
    saveAccuracy(accuracyRecording, trackNumber, accuracy, currentTime);
    console.log("Track #" + (trackNumber + 1) + " " + accuracyName + (Math.abs(accuracy) == Infinity ? "" : " (" + Math.round(accuracy) + " ms)"));
}