import webpack from "webpack";

import singleSpaDefaults from "webpack-config-single-spa-ts";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { fileURLToPath } from 'url';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { mergeWithRules } from 'webpack-merge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (webpackConfigEnv, argv) => {

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
      target: "es2022",
      output: {
        filename: "madie-madie-layout.js",
        module: true,
        library: {
          type: "module"
        }
      },
      experiments: {
        outputModule: true
      },
      externalsType: "module",
      externals: {
        react: "react",
        "react-dom": "react-dom",
        "react-dom/client": "react-dom/client",
        'react/jsx-runtime': 'react/jsx-runtime',
        'react/jsx-dev-runtime': 'react/jsx-dev-runtime',

        "@madie/madie-root": "@madie/madie-root",
        "@madie/madie-auth": "@madie/madie-auth",
        "@madie/madie-measure": "@madie/madie-measure",
        "@madie/madie-editor": "@madie/madie-editor",
        "@madie/madie-cql-library": "@madie/madie-cql-library",
        "@madie/madie-util": "@madie/madie-util",
      },
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
        // teach webpack how to read the binaries
        {
          test: /\.(woff(2)?|ttf|otf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[name].[ext]",
                outputPath: "fonts/",
              },
            },
          ],
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
            "node_modules/@madie/madie-editor/dist/"
          ),
          publicPath: "/madie-editor",
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

  // const esmResolveConfig = {
  //   resolve: {
  //     mainFields: ["exports", "module", "browser", "main"],
  //     conditionNames: ["import", "require", "default"],
  //     alias: {},
  //   },
  // };

const polyfillConfig = {
    resolve: {
      alias: {
        axios: path.resolve(__dirname, "node_modules/axios/dist/esm/axios.js"),
        "axios/lib/adapters/http": "axios/lib/adapters/xhr",
        'node-fetch': false,
        'buffer': false,
      },
      fallback: {
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        util: false,
        tty: false,
        "form-data": false,
        "combined-stream": false,
      },
    },
    plugins: [
      new webpack.IgnorePlugin({ resourceRegExp: /^form-data$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^combined-stream$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^util$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^follow-redirects$/ }),
      new webpack.NormalModuleReplacementPlugin(
        /axios\/lib\/adapters\/http\.js/,
        path.resolve(__dirname, "node_modules/axios/lib/adapters/xhr.js")
      )
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
  })
  (
    // externalsConfig, defaultConfig, newCssRule,polyfillConfig, copyConfig
    defaultConfig,
    newCssRule,
    copyConfig,
    // watchConfig,
    externalsConfig,
    polyfillConfig,
    // esmResolveConfig,
  );
  
};