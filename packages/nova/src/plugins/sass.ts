import type { Plugin } from "esbuild";
import sass from "sass";

import { getPath } from "./util.js";

type SassCompileOptions = sass.Options<"sync">;

export type SassPluginOptions = {
	sassOptions?: SassCompileOptions;
};

function compileSass(path: string, options: SassCompileOptions = {}) {
	return sass.compile(path, options).css;
}

export default (options: SassPluginOptions = {}) =>
	({
		name: "@nova/esbuild-plugin-sass",

		setup: (build) => {
			// This should probably be flaggable at some point? This'd really cause issues if
			// you wanted to use this plugin without the cssModules plugin
			build.onResolve({ filter: /\.module\.scss$/ }, async (args) => ({
				path: getPath(args),
				namespace: "css-module",
				pluginData: {
					source: compileSass(getPath(args), options.sassOptions),
				},
			}));

			build.onLoad({ filter: /\.scss$/ }, async (args) => ({
				loader: "css",
				contents: compileSass(args.path, options.sassOptions),
				watchFiles: [args.path],
			}));
		},
	} as Plugin);
