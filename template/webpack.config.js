const path = require('path');
const webpack = require('webpack');
const mockup = require('webpack-dev-server-mock');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');

const Weinre = require('weinre-webpack').default;

const isProduction = process.env.NODE_ENV === 'production';

const utils = {};

utils.resolveStaticPath = function (path) {
    return 'static/dist' + path;
};

utils.getIPAdress = function () {
    let interfaces = require('os').networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};

const env = {
    NODE_ENV: `"${process.env.NODE_ENV}"`
};

module.exports = {
    entry: {
        // vendor
        // vendor: ['babel-polyfill', 'vue', 'vue-router', 'zepto-hh', 'moment', 'underscore', 'mint-ui'],
        // page
        main: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, './output'),
        publicPath: '/',
        filename: utils.resolveStaticPath('/js/[name]_[chunkhash:7].js'),
        chunkFilename: utils.resolveStaticPath('/js/[name]_[chunkhash:7].js')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    // vue-loader options go here
                    loaders: {
                        // 'less': 'vue-style-loader!css-loader?-autoprefixer!postcss-loader!less-loader'
                        less: [
                            'vue-style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins() {
                                        return [autoprefixer];
                                    }
                                }
                            },
                            {
                                loader: 'less-loader',
                                options: {}
                            }
                        ]
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(css|less)$/,
                // use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
                use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [{
                            loader: 'css-loader',
                            options: {
                                modules: false
                            },
                        }, {
                            loader: 'postcss-loader',
                            options: {
                                plugins() {
                                    return [autoprefixer];
                                }
                            }
                        }, {
                            loader: 'less-loader',
                            options: {}
                        }]
                    }
                )
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
                loader: 'url-loader',
                query: {
                    limit: '3000',
                    name: utils.resolveStaticPath('/img/[name]_[hash:7].[ext]')
                }
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: utils.resolveStaticPath('/fonts/[name]_[hash:7].[ext]')
                }
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh/),
        new webpack.LoaderOptionsPlugin({
            minimize: isProduction,
            options: {
                context: __dirname,
                postcss: [autoprefixer]
            }
        }),
        new webpack.ProvidePlugin({
            $: 'zepto-hh'
        }),
        new ExtractTextPlugin({
            filename: utils.resolveStaticPath('/css/[name]_[contenthash:7].css'),
            // allChunks: true
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
            minify: {
                removeComments: isProduction,
                collapseWhitespace: isProduction,
                removeAttributeQuotes: isProduction
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(path.join(__dirname, './node_modules')) === 0
                );
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            filename: utils.resolveStaticPath('/js/manifest_[hash:7].js'),
            chunks: ['vendor']
        }),
        /**
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: utils.resolveStaticPath('/js/vendor_[hash:7].js')
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
            chunks: ['vendor', 'main'],
            minify: {
                removeComments: true,
                collapseWhitespace: isProduction,
                removeAttributeQuotes: false,
                minifyCSS: true
            }
        })
         */
    ],
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        modules: ['node_modules'],
        plugins: [
        ],
        alias: {
            'vue$': 'vue/dist/vue',
            'vue-router$': 'vue-router/dist/vue-router',
            // 公共代码
            '@common': path.resolve(__dirname, './src/common'),
            // 自定义业务组件
            '@ui': path.resolve(__dirname, './src/ui'),
            // 静态资源或第三方库
            '@static': path.resolve(__dirname, './src/static'),
            '@': path.resolve(__dirname, './src'),
        }
    },
    externals: {
    },
    devServer: {
        host: utils.getIPAdress(),
        historyApiFallback: {
            rewrites: [{
                from: /\//,
                to: '/index.html'
            }]
        },
        overlay: {
            errors: true
        },
        compress: true,
        noInfo: true
    },
    devtool: '#cheap-module-eval-source-map',
    // devtool: '#source-map'
    // devtool: 'eval-source-map'
    // devtool: 'eval'
};


// 开发环境使用模拟数据
if (process.env.NODE_ENV !== 'testing') {
    module.exports.devServer.setup = mockup.setup({
        root: path.resolve(__dirname, 'mockup'),
        prefix: ['/api/*']
    });
}

const TEST_SERVER = '{{ server }}';

// 测试环境使用线下测试数据
if (process.env.NODE_ENV === 'testing') {
    module.exports.devServer.proxy = {
        '/api/*': {
            target: TEST_SERVER,
            changeOrigin: true
        }
    };
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map';
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: false
        }),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, './static'),
                to: 'static',
                ignore: ['.*']
            }
        ])
    ]);
}
else if (process.env.npm_config_dashboard){
    const dashboard = new Dashboard();
    module.exports.plugins = (module.exports.plugins || []).concat([
        new DashboardPlugin(dashboard.setData),
        /**
        new Weinre({
            runServer       : true,        // whether run weinre server in background when run webpack
            defaultId       : '"anonymous"', // define a default id, if define 'auto', it will give you a random id. format is `${platform}-${browser}-${uid}`
            appendScriptTag : true,        // whether inject socket script tag automatically
            // see: http://people.apache.org/~pmuellr/weinre/docs/latest/Running.html
            httpPort        : 8900,        // if not define, it can use a idle port
            boundHost       : utils.getIPAdress(), // if not define, it can use local ip( not 127.0.0.1)
            verbose         : false,
            debug           : false,
            readTimeout     : 5,
            deathTimeout    : 15,
        }),
        */
    ]);
}
