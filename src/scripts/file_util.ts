import {audioSource} from "./index";

export function loadTextFile(
    file: File,
    listener: (event: ProgressEvent<FileReader>) => any,
    options?: boolean | AddEventListenerOptions
) {
    let fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.addEventListener("loadend", listener, options);
}

export function loadSoundFile(
    file: File,
    listener: (event: ProgressEvent<FileReader>) => any,
    options?: boolean | AddEventListenerOptions
) {
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.addEventListener("loadend", listener, options);
}

export function playAudio() {
    audioSource.start(0);
}

export function stopAudio() {
    audioSource.stop(0);
}