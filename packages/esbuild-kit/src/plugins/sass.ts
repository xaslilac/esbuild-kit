import type { Plugin } from "esbuild";
import type * as sass from "sass";

import { getPath } from "./util.js";

export type SassPluginOptions = { sassOptions?: SassCompileOptions };
type SassCompileOptions = sass.Options<"sync">;

export default (options: SassPluginOptions = {}) =>
	({
		name: "esbuild-kit/esbuild-plugin-sass",

		setup: (build) => {
			const sassImport = import("sass");

			async function compileSass(path: string, options: SassCompileOptions = {}) {
				const { default: sass } = await sassImport;
				return sass.compile(path, options).css;
			}

			// This should probably be flaggable at some point? This'd really cause issues if
			// you wanted to use this plugin without the cssModules plugin
			build.onResolve({ filter: /\.module\.scss$/ }, async (args) => ({
				path: getPath(args),
				namespace: "css-module",
				pluginData: {
					source: await compileSass(getPath(args), options.sassOptions),
				},
			}));

			build.onLoad({ filter: /\.scss$/ }, async (args) => ({
				loader: "css",
				contents: await compileSass(args.path, options.sassOptions),
				watchFiles: [args.path],
			}));
		},
	} as Plugin);
