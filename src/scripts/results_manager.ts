import * as p5 from "p5";
import {drawAccuracyBars} from "./drawing_util";
import {Accuracy} from "./gameplay";
import {config} from "./playing_display";

export class ResultsManager {
    accuracyRecording: { time: number, accuracy: number }[][];

    initialize(accuracyRecording: { time: number, accuracy: number }[][]) {
        this.accuracyRecording = accuracyRecording;
    }

    draw(p: p5) {
        p.clear();
        this.drawAccuracyResults(p, config.accuracySettings, this.accuracyRecording);
    }

    private drawAccuracyResults(p: p5, accuracySettings: Accuracy[],
                                accuracyRecording: { time: number; accuracy: number }[][]) {
        let centerX = p.width / 2;
        let centerY = p.height / 2;
        let barWidth = p.width * 0.6;
        let barHeight = barWidth / 10;
        let leftLabelHeight = 0.8 * barHeight;
        let accuracyListForResults = this.getResultsAccuracyList(accuracySettings);
        drawAccuracyBars(p, accuracyListForResults, accuracyRecording, centerX, centerY, leftLabelHeight, barWidth, barHeight);
    }

    // return a list of unique accuracies sorted by the offset, with the best accuracy being first
    private getResultsAccuracyList(accuracySettings: Accuracy[]): string[] {
        let accuracyTable: { accuracyName: string, sortValue: number }[] = accuracySettings.map(accuracy => {
            return {
                accuracyName: accuracy.name,
                sortValue: this.getAccuracySortingValue(accuracy.lowerBound, accuracy.upperBound)
            };
        });
        let mergedAccuracyTable: { accuracyName: string, sortValue: number }[] =
            this.mergeAccuraciesWithSameName(accuracyTable);
        mergedAccuracyTable.sort(this.accuracyTableSortFunction);
        return mergedAccuracyTable.map(row => row.accuracyName);
    }

    private getAccuracySortingValue(lowerBound: number, upperBound: number) {
        if (lowerBound == null) {
            return Math.abs(upperBound);
        }
        if (upperBound == null) {
            return Math.abs(lowerBound);
        }
        return Math.abs((upperBound + lowerBound) / 2);
    }

    private mergeAccuraciesWithSameName(accuracyTable: { accuracyName: string; sortValue: number }[]) {
        let mergedAccuracyTable: { accuracyName: string, sortValue: number }[] = [];
        while (accuracyTable.length > 0) {
            let keyAccuracyName = accuracyTable[0].accuracyName;
            let matchedAccuracies = accuracyTable.filter(row => row.accuracyName === keyAccuracyName);
            let sortValueAverage = matchedAccuracies
                    .reduce((sum, row) => sum + row.sortValue, 0)
                / matchedAccuracies.length;
            mergedAccuracyTable.push({accuracyName: keyAccuracyName, sortValue: sortValueAverage});
            accuracyTable = accuracyTable.filter(row => row.accuracyName !== keyAccuracyName);
        }
        return mergedAccuracyTable;
    }

    private accuracyTableSortFunction(a: { accuracyName: string, sortValue: number },
                                      b: { accuracyName: string, sortValue: number }) {
        return a.sortValue - b.sortValue;
    }
}

export let resultsManager: ResultsManager = new ResultsManager(); //TODO: move to Globals class
