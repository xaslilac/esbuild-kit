import type { Plugin } from "esbuild";
import * as fs from "fs/promises";
import sass from "sass";

export default {
	name: "@nova/esbuild-plugin-sass",

	setup: (build) => {
		build.onLoad({ filter: /\.scss$/ }, async (args) => ({
			loader: "css",

			contents: await new Promise(async (resolve, reject) =>
				sass.render(
					{ data: await fs.readFile(args.path, "utf-8") },
					(error, result) => {
						if (error) {
							reject(error);
							return;
						}

						resolve(result.css.toString("utf-8"));
					},
				),
			),
		}));
	},
} as Plugin;
