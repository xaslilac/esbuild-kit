import type { Plugin } from "esbuild";
import * as fs from "fs/promises";
import postcss from "postcss";
import postcssModules from "postcss-modules";

import { getPath } from "./util.js";

/**
 * Allows us to get the JSON map and the resulting CSS together, given an input string.
 */
export function transformCssModules(inputCss: string): Promise<[string, string]> {
	return new Promise<[string, string]>((resolveOutputCss) => {
		const jsonPromise = new Promise<string>(async (resolveJson) => {
			const compiler = postcss([
				postcssModules({
					generateScopedName: "[local]-[contenthash:base64:5]",
					getJSON: (_, json) => resolveJson(JSON.stringify(json)),
				}),
			]);

			const outputCss = await compiler.process(inputCss, {
				from: undefined,
			});

			resolveOutputCss(await Promise.all([outputCss.css, jsonPromise]));
		});
	});
}

export default {
	name: "@nova/esbuild-plugin-css-modules",

	setup: (build) => {
		const cache = new Map<string, string>();

		// Register files ending in .module.css as CSS modules. We also read the file
		// contents here, to enable other plugins to add additional support for other
		// CSS-likes. For example, our sass plugin does the Sass compilation in the
		// resolve phase.
		build.onResolve({ filter: /\.module\.css$/ }, async (args) => ({
			path: getPath(args),
			namespace: "css-module",
			pluginData: {
				source: await fs.readFile(getPath(args), "utf-8"),
			},
		}));

		// Transform any file registered as a CSS module
		build.onLoad({ filter: /./, namespace: "css-module" }, async (args) => {
			const [css, json] = await transformCssModules(args.pluginData.source);

			// Set the values for each of the two virtual modules we want to create
			cache.set(`${args.path}?css`, css);
			cache.set(`${args.path}?json`, json);

			// This is the only way ESBuild supports virtual modules. It's not the
			// prettiest, but it works. Basically we import the CSS to be included
			// in the CSS bundle, and then export the transformed names as JSON.
			return {
				loader: "js",
				contents: `
					import "${args.path}?css";
					import * as map from "${args.path}?json";
					export default map;
				`,
			};
		});

		// Register our internal module handlers for the two virtual modules that we generate
		build.onResolve({ filter: /\?(css|json)$/, namespace: "css-module" }, (args) => ({
			path: args.path,
			namespace: "@nova/css-modules",
		}));

		// Fetch the CSS portion of the module from the cache
		build.onLoad(
			{
				filter: /\?css$/,
				namespace: "@nova/css-modules",
			},
			(args) => ({
				loader: "css",
				contents: cache.get(args.path),
			}),
		);

		// Fetch the JSON portion of the module from the cache
		build.onLoad(
			{
				filter: /\?json$/,
				namespace: "@nova/css-modules",
			},
			(args) => ({
				loader: "json",
				contents: cache.get(args.path),
			}),
		);
	},
} as Plugin;
