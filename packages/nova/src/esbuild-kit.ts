import { build, type BuildOptions } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import { perfPlugin } from "./plugins/index.js";

const outputExtensions = new Map([
	["esm", ".mjs"],
	["cjs", ".cjs"],
]);

interface KitBuildOptions extends Omit<BuildOptions, "entryPoints" | "format"> {
	entryPoint: string;
	formats: Array<BuildOptions["format"]>;
}

export default async function (...builds: KitBuildOptions[]) {
	const watch = process.argv.includes("-w");

	const defaultEntryPoint = (await fs.stat("./src/index.ts").then(
		() => true,
		() => false,
	))
		? "./src/index.ts"
		: "./src/index.js";

	await Promise.all([
		builds
			.flatMap((buildOptions) => {
				const { formats = ["esm"], ...opts } = buildOptions;
				return formats.map((format) => ({ format, ...opts }));
			})
			.map((buildOptions) => {
				const {
					entryPoint = defaultEntryPoint,
					format = "esm",
					outbase = "./src/",
					outdir = "./build/",
					plugins = [],
					...esbuildOptions
				} = buildOptions;

				const baseName = path.basename(
					path.relative(outbase, entryPoint),
					path.extname(entryPoint),
				);

				const ext = outputExtensions.get(format) ?? ".js";

				return build({
					entryPoints: [entryPoint],
					bundle: true,
					format,
					outbase,
					outfile: path.join(outdir, `${baseName}${ext}`),
					plugins: [perfPlugin(), ...plugins].filter(Boolean),
					sourcemap: true,
					watch,
					write: true,
					...esbuildOptions,
				});
			}),
	]);
}
