import type { Plugin } from "esbuild";
import * as fs from "fs/promises";
import postcss from "postcss";
import postcssModules from "postcss-modules";

const namespace = "@nova/esbuild-plugin-css-modules";
type CssModule = { css: string; json: Record<string, string> };

export async function transformCssModules(inputCss: string): Promise<CssModule> {
	const outputCssPromise = new Promise<[string, Record<string, string>]>(
		async (resolveOutputCss) => {
			const jsonPromise = new Promise<Record<string, string>>(
				async (resolveJson) => {
					const compiler = postcss([
						postcssModules({
							generateScopedName: "[local]-[contenthash:base64:5]",
							getJSON: (_, json) => resolveJson(json),
						}),
					]);

					const outputCss = await compiler.process(inputCss);

					resolveOutputCss(await Promise.all([outputCss.css, jsonPromise]));
				},
			);

			await jsonPromise;
		},
	);

	const [css, json] = await outputCssPromise;
	return { css, json };
}

export default {
	name: namespace,

	setup: (build) => {
		const cache = new Map<string, CssModule>();

		build.onLoad({ filter: /\.module\.css$/ }, async (args) => {
			cache.set(
				args.path,
				await transformCssModules(await fs.readFile(args.path, "utf-8")),
			);

			return {
				loader: "js",
				namespace,
				contents: `
					import "${args.path}?css";
					export * from "${args.path}?json";
				`,
			};
		});

		build.onLoad({ filter: /\.module.css\?css$/, namespace }, async (args) => {
			return {
				loader: "css",
				contents: cache.get(args.path)?.css,
			};
		});

		build.onLoad({ filter: /\.module.css\?json$/, namespace }, async (args) => {
			return {
				loader: "json",
				contents: JSON.stringify(cache.get(args.path)?.json),
			};
		});
	},
} as Plugin;
