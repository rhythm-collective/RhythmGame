interface Drawable {
    draw: () => void;
    [propName: string]: any;
}