import * as p5 from "p5";
import {noteManager} from "./playing_display";
import {accuracyManager} from "./gameplay";

export function drawAccuracyBars(p: p5, accuracyLabels: string[],
                                 accuracyRecording: { time: number; accuracy: number }[][],
                                 centerX: number, centerY: number, textSize: number, barWidth: number,
                                 barHeight: number) {
    let maxTextWidth = getMaxTextWidth(p, accuracyLabels, textSize);
    let totalNotes = noteManager.getTotalNotes();
    let barSpacing = 10;
    let totalHeight = accuracyLabels.length * barHeight + (accuracyLabels.length - 1) * barSpacing;
    let startY = (p.height - totalHeight) / 2 + barHeight / 2;
    for(let i = 0; i < accuracyLabels.length; i++) {
        let accuracyLabel = accuracyLabels[i];
        let numAccuracyEvents = getNumAccuracyEvents(accuracyLabel, accuracyRecording);
        let percentFilled = numAccuracyEvents / totalNotes;
        drawAccuracyBar(p, centerX, startY + i * (barHeight + barSpacing), accuracyLabel, numAccuracyEvents.toString(), totalNotes.toString(), textSize, maxTextWidth, barWidth, barHeight, percentFilled);
    }
}

function getNumAccuracyEvents(accuracyLabel: string, accuracyRecording: { time: number; accuracy: number }[][]) {
    return accuracyRecording.reduce((sum, trackRecording) =>
        sum + trackRecording.filter(accuracyEvent =>
            accuracyManager.getAccuracyName(accuracyEvent.accuracy) === accuracyLabel).length, 0);
}

function getMaxTextWidth(p: p5, textArray: string[], textSize: number) {
    p.push();
    p.textSize(textSize);
    let maxTextWidth = textArray.map((string) => p.textWidth(string))
        .reduce((maxWidth, width) => Math.max(maxWidth, width, -1));
    p.pop();
    return maxTextWidth;
}

export function drawAccuracyBar(p: p5, centerX: number, centerY: number, label1: string, label2: string, label3: string,
                                textSize: number, largestTextWidth: number, barWidth: number, barHeight: number,
                                percentFilled: number) {
    let spacingBetweenBarAndLabel = 8;
    let totalWidth = largestTextWidth + spacingBetweenBarAndLabel + barWidth;
    let labelRightmostX = centerX - totalWidth / 2 + largestTextWidth;
    drawRightAlignedLabel(p, labelRightmostX, centerY, label1, textSize);

    let barRightX = centerX + totalWidth / 2;
    let barLeftX = barRightX - barWidth;
    let barCenterX = (barLeftX + barRightX) / 2;
    drawPartiallyFilledBar(p, barCenterX, centerY, barWidth, barHeight, percentFilled, textSize, label2, label3);
}

export function drawRightAlignedLabel(p: p5, rightmostX: number, centerY: number, text: string, textSize: number) {
    p.push();
    p.textSize(textSize);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(text, rightmostX, centerY);
    p.pop();
}

export function drawPartiallyFilledBar(p: p5, centerX: number, centerY: number, width: number, height: number,
                                       percentFilled: number, textSize: number, startLabel: string, endLabel: string) {
    p.push();
    p.rectMode(p.CENTER);

    // draw the filled part of the bar
    p.fill("gray");
    p.rect(centerX - (width * (1 - percentFilled) / 2), centerY, width * percentFilled, height);

    // draw the outline of the bar
    p.noFill();
    p.rect(centerX, centerY, width, height);

    // draw the labels on the ends of the bar
    let labelSize = 1.5 * textSize;
    p.fill("black");
    p.textSize(labelSize);
    p.textAlign(p.LEFT, p.CENTER);
    p.text(startLabel, centerX - width / 2, centerY + 2);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text(endLabel, centerX + width / 2, centerY + 2);
    p.pop();
}