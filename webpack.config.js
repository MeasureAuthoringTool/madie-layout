const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const { mergeWithRules } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");
const path = require("path");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "madie",
    projectName: "madie-layout",
    webpackConfigEnv,
    orgPackagesAsExternal: false,
    disableHtmlGeneration: true, // false causes multiple assets served as index.html
    argv,
  });
  // const mergeConfig
  // We need to override the css loading rule from the parent configuration
  // so that we can add postcss-loader to the chain
  const externalsConfig = {
    externals: [
      "@madie/madie-auth",
      "@madie/madie-root",
      "@madie/madie-cql-library",
      "@madie/madie-measure",
      "@madie/madie-admin",
      "@madie/madie-util",
      // Shared singleton libraries — loaded once via import map
      "@emotion/react",
      "@emotion/styled",
      "styled-components",
    ],
  };
  const newCssRule = {
    module: {
      rules: [
        {
          test: /\.css$/i,
          include: [/node_modules/, /src/],
          use: [
            "style-loader",
            "css-loader", // uses modules: true, which I think we want. Parent does not
            "postcss-loader",
          ],
        },
        {
          test: /\.scss$/,
          resolve: {
            extensions: [".scss", ".sass"],
          },
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
              options: { sourceMap: true, importLoaders: 2 },
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
              },
            },
            {
              loader: "sass-loader",
            },
          ],
          exclude: /node_modules/,
        },
        // teach webpack how to read the binaries. file-loader doesn't work in webpack 5
        {
          test: /\.(woff2?|ttf|otf|eot)$/,
          type: "asset/resource",
        },
      ],
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "local-dev-env"),
          publicPath: "/importmap",
        },
        {
          directory: path.join(
            __dirname,
            "node_modules/@madie/madie-root/dist/"
          ),
          publicPath: "/",
        },
        {
          directory: path.join(
            __dirname,
            "node_modules/@madie/madie-auth/dist/"
          ),
          publicPath: "/madie-auth",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(
          __dirname,
          "node_modules/@madie/madie-root/dist/index.html"
        ),
      }),
      // react-draggable (used by the design system's MadieDialog) contains
      // `if (process.env.DRAGGABLE_DEBUG) ...` which runs on every mousedown
      // inside a dialog. Webpack 5 does not shim the Node `process` global in
      // browser bundles and only replaces `process.env.NODE_ENV`, Defining
      // the flag makes webpack substitute `false` at build time, so `process`
      // is never evaluated in the browser (and the dead branch is stripped in
      // production builds).
      new webpack.DefinePlugin({
        "process.env.DRAGGABLE_DEBUG": JSON.stringify(false),
      }),
    ],
  };
  // we need to pull out the styles and images, import them with scss.
  const copyConfig = {
    resolve: {
      fallback: {
        fs: false,
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/@madie/madie-design-system/fonts/",
            to: path.resolve("public/fonts"),
          },
          {
            from: "node_modules/@madie/madie-design-system/images/",
            to: path.resolve("public/images"),
          },
        ],
      }),
    ],
  };

  return mergeWithRules({
    module: {
      rules: {
        test: "match",
        use: "replace",
      },
    },
    plugins: "append",
  })(externalsConfig, defaultConfig, newCssRule, copyConfig);
};
