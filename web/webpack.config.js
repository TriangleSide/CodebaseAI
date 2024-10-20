const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        home: './src/home/index.tsx',
        amalgam: './src/amalgam/index.tsx',
        projects: './src/projects/index.tsx',
        chat: './src/chat/index.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: (pathData) => {
            return pathData.chunk.name === 'home' ? 'bundle.js' : '[name]/bundle.js';
        },
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/template.html',
            chunks: ['home'],
        }),
        new HtmlWebpackPlugin({
            filename: 'amalgam/index.html',
            template: './src/template.html',
            chunks: ['amalgam'],
        }),
        new HtmlWebpackPlugin({
            filename: 'projects/index.html',
            template: './src/template.html',
            chunks: ['projects'],
        }),
        new HtmlWebpackPlugin({
            filename: 'chat/index.html',
            template: './src/template.html',
            chunks: ['chat'],
        }),
    ],
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback: true,  // Let React Router handle the routes
    },
    mode: 'development',
};
