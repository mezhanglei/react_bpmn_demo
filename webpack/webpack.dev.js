"use strict";

const fs = require('fs');
// 1. path.join('字段1','字段2'....) 使用平台特定的分隔符把所有的片段链接生成相对路径,遇到..和../时会进行相对路径计算
// 2. path.resolve('字段1','字段2'....) 从右到左拼接路径片段,返回一个相对于当前工作目录的绝对路径,当遇到/时表示根路径,遇到../表示上一个目录, 如果还不是完整路径则自动添加当前绝对路径
const path = require("path");
// 引入webpack
const webpack = require("webpack");
// 1.为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题
// 2.打包时创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 对webpack打包构建的信息进行处理 可以选择使用或不使用
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
// stylelint的样式检查
const StyleLintPlugin = require("stylelint-webpack-plugin");
// 通过CopyWebpackPlugin将目标文件夹里的静态资源拷贝到目标文件夹
const CopyWebpackPlugin = require("copy-webpack-plugin");
// 引入主题文件
// const them = require(path.join(configs.root, "src/assets/css/them.less"));
// 引入配置
const configs = require('./configs.js');

// === webpack的loader扩展 === //

// eslint的loader配置, 默认配置文件为项目根目录下的.eslintrc.js
const useEslintLoader = {
    loader: "eslint-loader",
    options: {
        eslintPath: configs.eslintPath
    }
};


// === webpack的plugins扩展 === //

// stylelint的plugin配置
const useStylelintPlugin = new StyleLintPlugin({
    // 要检查scss的根目录
    context: configs.checkStyleRoot,
    // 1.扫描要检查的文件, 字符串或者数组, 将被glob接收所以支持style/**/*.scss这类语法
    // 2.我们也可以通过在package.json中配置命令的方式(--ext表示扩展名)
    files: configs.checkStylePath,
    // 配置文件的路径
    configFile: configs.stylelintPath,
    // 如果为true，则在全局构建过程中发生任何stylelint错误时结束构建过程 所以一般为false
    failOnError: false,
});


// === 自定义方法 === //

// 自动获取可远程访问的ip
const os = require("os");
function getNetworkIp() {
    // 打开的host
    let needHost = "";
    try {
        // 获得网络接口对象
        let network = os.networkInterfaces();
        // 遍历网络接口对象得到ipv4且不为127.0.0.1且internal为fasle(可远程访问)的host
        Object.keys(network).map((item) => {
            // 遍历每个类型的网络地址列表
            network[item].map((sub) => {
                if (
                    sub.family === "IPv4" &&
                    sub.address !== "127.0.0.1" &&
                    !sub.internal
                ) {
                    needHost = sub.address;
                }
            });
        });
    } catch (e) {
        needHost = "localhost";
    }
    return needHost;
}

//  === webpack配置内容 === //
module.exports = {
    // 对象语法： 1. 当有多条数据，则会打包生成多个依赖分离的入口js文件, 对象中的值为路径字符串数组或路径字符串，会被打包到该条数据对应生成的入口js文件
    // 字符串语法: 2. 单页面对应的入口文件路径 
    entry: configs.entry,
    // 解析的起点, 默认为项目的根目录
    context: configs.root,
    // 输出
    output: {
        // 输出目录
        path: configs.outputPath,
        // 用[name]动态表示打包的名称 名称默认为入口文件指定的键
        filename: '[name].js',
        // 资源引用的公共绝对路径
        publicPath: configs.publicPath
    },
    // process.env会返回用户的环境变量 process.env.NODE_ENV用来设置当前构建脚本是开发阶段还是生产阶段
    // mode一共可设置三种环境production development none 分别表示生产环境还是开发环境还是什么都不做
    // mode设置的作用主要是根据当前环境进行一些优化工作
    // development 开启NamedChunksPlugin 和 NameModulesPlugin
    // production开启FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin(减少声明和闭包引起的内存开销), NoEmitOnErrorsPlugin, occurrenceOrderPlugin, SideEffectsFlagPlugin, TerserWebpackPlugin(统一提取js和css)
    mode: "development",
    // 用来指定loaders的匹配规则和指定使用的loaders名称
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                // babel-loader的核心依赖为@babel/core
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            // 不使用默认的配置路径
                            babelrc: false,
                            // 配置新的babelrc路径
                            extends: configs.babelPath,
                            // 开启babel-loader缓存的参数
                            cacheDirectory: true
                        }
                    },
                    // eslint
                    ...(configs.useEslint ? [useEslintLoader] : [])
                ],
                // include: path.resolve("src"),
                // 忽略第三方(看第三方包是否需要转译,不需要的话去掉)
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                // 这里需要遵循一定的顺序 因为是compose函数方式先解析css-loader然后插入到style-loader
                use: [
                    // style-loader 把 js 中 import 导入的样式文件代码，打包到 js 文件中，运行 js 文件时，将样式自动插入到<style>标签中
                    "style-loader",
                    // css-loader解析几个css之间的关系 最终把几个css文件打包成一个css文件
                    "css-loader"
                ],
            },
            {
                test: /\.less$/,
                exclude: /(\.module\.less)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "less-loader",
                        options: {
                            // modifyVars: {
                            //   "@brand-primary": "red"
                            // },
                            modifyVars: {
                                // 引入antd 主题颜色覆盖文件
                                hack: `true; @import "${path.join(
                                    configs.root,
                                    "less/constants/ant-design-theme.less"
                                )}";`,
                            },
                            javascriptEnabled: true,
                        },
                    }
                ]
            },
            {
                test: /(\.module\.less)$/,
                use: [
                    "style-loader",
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'local',
                                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                context: configs.srcPath
                            },
                            importLoaders: 2,
                            localsConvention: 'camelCase'
                        } //css modules
                    },
                    "less-loader"
                ],
            },
            // {
            // 	test: /\.scss$/,
            // 	use: [
            // 		"style-loader",
            // 		"css-loader",
            // 		"sass-loader",
            // 	],
            // },
            // 使用url-loader也可以进行图片和字体的解析和打包 并且可以设置一定大小以下的图片转换成base64编码
            {
                test: /\.(png|svg|jpg|gif|jpeg|ico)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            // 小于20k全部打包成base64形式进入页面
                            limit: 20 * 1024,
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: "url-loader",
            },
            {
                test: /\.bpmnlintrc$/,
                use: [
                    {
                        loader: 'bpmnlint-loader',
                    }
                ]
            }
        ],
    },
    plugins: [
        // 加载webpack内置的热更新插件
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin(configs.providePlugin),
        // 清理dist目录
        // new CleanWebpackPlugin(),
        // 统计信息提示插件(比如错误或者警告会用带颜色的字体来显示,更加友好)
        new FriendlyErrorsWebpackPlugin(),
        // 设置项目的全局变量, 如果值是个字符串会被当成一个代码片段来使用, 如果不是,它会被转化为字符串(包括函数)
        new webpack.DefinePlugin({
            'process.env': {
                // mock数据环境
                MOCK: process.env.MOCK,
                // 资源引用的公共路径字符串
                PUBLIC_PATH: JSON.stringify(configs.publicPath || '/'),
            }
        }),
        // 将目标目录里的文件直接拷贝到输出dist目录
        new CopyWebpackPlugin([
            {
                from: configs.staticPath,
                to: configs.staticOutPath
                // 忽略文件名
                // ignore: ['.*']
            },
        ]),
        useStylelintPlugin,
        // htmlplugin
        new HtmlWebpackPlugin({
            // title: '生成的html文档的标题',
            // 指定输出的html文档
            filename: `index.html`,
            // html模板所在的位置，默认支持html和ejs模板语法，处理文件后缀为html的模板会与html-loader冲突
            template: path.join(configs.htmlPages, 'index.html'),
            // 不能与template共存，也可以指定html字符串
            // templateContent: string|function,
            // 默认script一次性引用所有的chunk(chunk的name)
            chunks: ["vendors", "common", `runtime~index`, 'index'],
            // 跳过一个块
            // excludeChunks: [],
            // 注入静态资源的位置:
            //    1. true或者body：所有JavaScript资源插入到body元素的底部
            //    2. head： 所有JavaScript资源插入到head元素中
            //    3. false：所有静态资源css和JavaScript都不会注入到模板文件中
            inject: true,
            // 图标的所在路径，最终会被打包到到输出目录
            // favicon: item.favicon,
            // 注入meta标签，例如{viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'}
            // meta: {},
            // 注入base标签。例如base: "https://example.com/path/page.html
            // base: false,
            minify: {
                // 根据html5规范输入 默认true
                html5: true,
                // 是否对大小写敏感 默认false
                caseSensitive: false,
                // 去除属性引用
                removeAttributeQuotes: process.env.NODE_ENV === "development" ? false : true,
                // 删除空格换行 默认false
                collapseWhitespace: process.env.NODE_ENV === "development" ? false : true,
                // 当标记之间的空格包含换行符时，始终折叠为1换行符（从不完全删除它）。collapseWhitespace=true, 默认false
                preserveLineBreaks: false,
                // 压缩link进来的本地css文件 默认false,需要和clean-css一起使用
                minifyCSS: false,
                // 压缩script内联的本地js文件 默认false,为true需要和teserwebpackplugin一起使用
                minifyJS: true,
                // 移除html中的注释 默认false
                removeComments: true
            },
            // 如果为true则为所有的script引入和css引入添加唯一的hash值
            // hash: false,
            // 错误详细信息将写入html
            // showErrors: true,
            // script引入的公共js文件
            commonJs: [
            ],
            // link引入的公共css文件
            commonCSS: [
                // `static/fonts/iconfont.css?time=${new Date().getTime()}`
            ]
        })
    ],
    // require 引用入口配置
    resolve: configs.resolve,
    // 配置webpack的开发服务器
    devServer: {
        // 在html引入静态资源时的根目录(默认为项目根目录)
        contentBase: configs.root,
        // 首次启动页面的html位置(相对于output目录)
        index: configs.indexHtml,
        // 在哪个url路径下首次访问启动页
        openPage: configs.openPage,
        // 有时无法访问可能是端口被占用
        port: 8035,
        // 启动webpack-dev-server时的host(设置为0.0.0.0无论是本机ip或127.0.0.1或localhost都会响应请求)
        host: getNetworkIp(),
        // 开启热更新
        hot: true,
        // true启动时和每次保存之后，那些显示的 webpack 包(bundle)信息将被隐藏。错误和警告仍然会显示, 和stats不能一起使用。
        // noInfo: true,
        // inline模式, 默认true在控制台中显示编译打包重新构建的状态
        inline: true,
        // 一切服务都启用gzip 压缩(也可以通过webpack-dev-server --compress启动)
        compress: true,
        // 当使用 HTML5 History API 时，任意的 404 响应都需要重定向对应的html页面
        historyApiFallback: {
            // 重定向
            rewrites: {
                // 正则匹配路由
                from: new RegExp(".*"),
                // 重定向的目标页面(必须/开头)
                to: (configs.publicPath + '/').replace(/\/+/g, '/') + 'index.html'
            }
        },
        // webpack 使用文件系统(file system)获取文件改动的通知, 但是当在远程进行操作时有可能会出问题,所以需要轮询
        watchOptions: {
            // 重建之前的延迟在此时间段内的改动将被一起聚合在一块重建
            aggregateTimeout: 300,
            // 打开轮询并设置周期
            poll: 1000,
            // 忽视的文件夹,多个文件夹使用这种形式['files/**/*.js', 'node_modules/**']
            ignored: /node_modules/,
        },
        // true启用https，false不启用
        https: false,
        // webpack启动或保存时命令行的信息,当配置了quiet或noInfo时，该配置不起作用
        stats: "errors-only",
        // 开发环境接口域名代理
        proxy: [
            {
                // 当以context里的任意一个字符串开头的接口都会通过本地代理访问目标接口域名下
                context: ["/api"],
                // 要代理访问的目标接口域名
                target: "http://localhost:3000",
                // 允许代理 websockets 协议
                ws: true,
                // true不接受运行在 HTTPS 上，且使用了无效证书的后端服务, false关闭安全检测
                secure: false,
                // 需要虚拟托管的站点要设为true，开发时大部分情况都是虚拟托管的站点
                changeOrigin: true,
                // 实际请求中不存在代理字段则重写接口路径把api字符串去掉
                pathRewrite: {
                    "^/api": "",
                }
            },
        ],
        // 将错误或警告覆盖显示在浏览器屏幕上
        // overlay: {
        //   // 显示警告信息
        //   warnings: false,
        //   // 显示错误信息
        //   errors: false
        // },
    },
    // 开启source-map 用途是为了在开发环境中便于调试错误 因为打包过后的代码和源代码不一样很难阅读 source map一般只在开发环境运行 生产环境还是保持混乱的状态防止逻辑暴露
    devtool: "source-map",
};
