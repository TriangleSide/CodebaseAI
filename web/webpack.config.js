const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCdnPlugin = require('webpack-cdn-plugin');

const entries = {
    home: './src/home/index.tsx',
    amalgam: './src/amalgam/index.tsx',
    projects: './src/projects/index.tsx',
    chat: './src/chat/index.tsx',
};

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    return {
        mode: isProduction ? 'production' : 'development',
        entry: entries,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: (pathData) => {
                return pathData.chunk.name === 'home' ? 'bundle.js' : '[name]/bundle.js';
            },
            publicPath: '/',
            clean: true,
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
            ...Object.keys(entries).map((key) => {
                return new HtmlWebpackPlugin({
                    inject: 'body',
                    filename: key === 'home' ? 'index.html' : `${key}/index.html`,
                    template: './src/template.html',
                    chunks: [key],
                });
            }),
            new WebpackCdnPlugin({
                modules: [
                    {
                        name: 'react',
                        var: 'React',
                        path: isProduction
                            ? 'umd/react.production.min.js'
                            : 'umd/react.development.js',
                    },
                    {
                        name: 'react-dom',
                        var: 'ReactDOM',
                        path: isProduction
                            ? 'umd/react-dom.production.min.js'
                            : 'umd/react-dom.development.js',
                    },
                ],
                sri: true,
                optimize: true,
                crossOrigin: 'anonymous',
            }),
        ],
        optimization: {
            minimize: isProduction,
        },
        devServer: {
            static: path.resolve(__dirname, 'dist'),
            port: 3000,
            open: true,
            hot: true,
        },
    };
};
