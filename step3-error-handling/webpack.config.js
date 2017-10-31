const path = require('path');

module.exports = {
    entry: './src/scripts/main.ts',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'app.js'
    },
    cache: true,
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            { test: /\.ts$/, use: [ 'ts-loader' ] }
        ]
    }
};
