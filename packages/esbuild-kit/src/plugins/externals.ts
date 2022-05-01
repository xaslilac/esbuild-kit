import type { Plugin } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

const NODE_BUILTINS = [
	"child_process",
	"crypto",
	"fs",
	"http",
	"https",
	"path",
	"perf_hooks",
	"stream",
];

type ExternalsPluginOptions = { bundle?: [] };

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

export default (options: ExternalsPluginOptions = {}) =>
	({
		name: "esbuild-kit/esbuild-plugin-externals",

		setup: async (build) => {
			const { bundle = [] } = options;

			if (!build.initialOptions.external) {
				build.initialOptions.external = [];
			}

			const uniqueExternals = new Set([
				...build.initialOptions.external,
				...NODE_BUILTINS,
				...(await findExternals()),
			]);

			bundle.forEach((packageName) => uniqueExternals.delete(packageName));

			build.initialOptions.external = [...uniqueExternals];
		},
	} as Plugin);
