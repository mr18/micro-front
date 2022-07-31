const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {
    aaa: path.resolve(__dirname, "./src/a.js"),
    bbb: {
      import: path.resolve(__dirname, "./src/b.js"),
      runtime: "runtime-111",
    },
    index: {
      import: path.resolve(__dirname, "./src/index.js"),
      runtime: "runtime-111",
    },
  },
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "./srcDist"), //打包后的文件存放的地方
    filename: "[name].entry.js", //打包后输出文件的文件名
    publicPath: "/",
    chunkFilename: "[name].[hash:6].chunk.js",
    libraryTarget: "umd",
    // pathinfo: true,
  },
  recordsPath: path.join(__dirname, "./records.json"),
  resolve: {
    extensions: [".js", ".jsx"],
  },
  externals: {
    react: "commonjs2 react",
    jquery: true,
  },
  experiments: {
    // outputModule: true,
  },
  // externalsType: "amd",
  // cache: {
  //   type: "filesystem",
  // },
  // snapshot: {
  //   resolveBuildDependencies: {
  //     timestamp: true,
  //   },
  // },
  devServer: {
    compress: true,
    port: 9000,
  },
  // watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    // poll: 1000,
  },
  optimization: {
    splitChunks: {
      minSize: 1,
      chunks: "all",
      cacheGroups: {
        //设置缓存组用来抽取满足不同规则的chunk,下面以生成common为例
        common: {
          name: "common", //抽取的chunk的名字
          minChunks: 2, //最少被几个chunk引用
          reuseExistingChunk: true, //	如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
          enforce: true, // 如果cacheGroup中没有设置minSize，则据此判断是否使用上层的minSize，true：则使用0，false：使用上层minSize
        },
      },
    },
    minimize: false,
  },
  // target: "electron-preload",
  // externalsPresets: {
  //   electronPreload: true,
  // },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    ],
  },
  // stats: "verbose",
  plugins: [
    // new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
    new webpack.DefinePlugin({
      "process.env": {
        myVar: JSON.stringify("VARVAR"),
      },
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
      chunks: ["index"],
    }),
  ],
};
