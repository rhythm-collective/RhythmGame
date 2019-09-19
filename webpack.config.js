const path = require('path');

module.exports = {
    entry: './src/scripts/index.ts',
    devtool: 'inline-source-map',
    mode: 'development',
    externals: {
        p5: 'p5'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'var',
        library: 'simparser'
    },
};