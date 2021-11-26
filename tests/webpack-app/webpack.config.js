const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBar = require("webpackbar");

module.exports = {
	mode: "development",
	target: "web",

	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(__dirname, "./public/index.html"),
		}),

		new WebpackBar(),
	],

	entry: path.join(__dirname, "./src/main.tsx"),

	output: { path: path.join(__dirname, "./target") },

	infrastructureLogging: {
		level: "warn",
	},

	stats: {
		preset: "errors-warnings",
		errorDetails: true,
	},

	devServer: {
		host: "127.0.0.1",
		port: 4000,
	},

	resolve: {
		extensions: [".js", ".cjs", ".mjs", ".ts", ".tsx"],

		alias: {
			"^": path.join(__dirname, "./src"),
		},
	},

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				loader: require.resolve("ts-loader"),
			},

			{
				test: /\.css$/i,
				use: [require.resolve("style-loader"), require.resolve("css-loader")],
			},
		],
	},
};
