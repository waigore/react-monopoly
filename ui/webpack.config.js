var path = require('path');
var webpack = require('webpack');

module.exports = {
    devServer: {
        inline: true,
        contentBase: './public',
        port: 3002
    },
    context: __dirname,
    devtool: 'cheap-module-eval-source-map',
    entry: './src/index.js',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query:
                  {
                    presets:['env', 'react'],
                    plugins: ["transform-class-properties"]
                  }
            },
            {
                test: /\.scss/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /\.css/,
                loader: 'style-loader!css-loader'
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/bundle.min.js'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin()
    ]
};
