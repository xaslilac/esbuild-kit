import { build, type BuildOptions } from "esbuild";

import { perfPlugin } from "./plugins/index.js";

export default async function (...builds: BuildOptions[]) {
	const watch = process.argv.includes("-w");

	await Promise.all([
		builds.map((buildOptions) => {
			const { plugins = [], ...esbuildOptions } = buildOptions;

			return build({
				bundle: true,
				outbase: "./src/",
				plugins: [perfPlugin(), ...plugins].filter(Boolean),
				sourcemap: true,
				watch,
				write: true,
				...esbuildOptions,
			});
		}),
	]);
}
