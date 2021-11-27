import svgr from "@svgr/core";
import type { Plugin } from "esbuild";
import * as fs from "fs/promises";

export default {
	name: "@nova/esbuild-plugin-svgr",
	setup: (build) => {
		build.onLoad({ filter: /\.svg$/ }, async (args) => {
			const svg = await fs.readFile(args.path, "utf-8");
			const contents = await svgr.transform(
				svg,
				{},
				{ filePath: args.path, componentName: "ReactComponent" },
			);

			return {
				loader: "jsx",
				contents: `${contents};export { ReactComponent };`,
			};
		});
	},
} as Plugin;
