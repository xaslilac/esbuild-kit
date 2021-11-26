import type { Plugin } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

async function findExternals(externalsPath: string = process.cwd()): Promise<string[]> {
	const nextExternalsPath = path.join(externalsPath, "..");
	const parentExternals =
		nextExternalsPath !== externalsPath ? await findExternals(nextExternalsPath) : [];

	try {
		const externals = await fs.readdir(path.join(externalsPath, "node_modules"));

		return [...externals, ...parentExternals];
	} catch {
		return parentExternals;
	}
}

export default {
	name: "@nova/esbuild-plugin-externals",

	setup: async (build) => {
		if (!build.initialOptions.external) {
			build.initialOptions.external = [];
		}

		build.initialOptions.external = [
			...build.initialOptions.external,
			...(await findExternals()),
		];
	},
} as Plugin;
