import type { Plugin } from "esbuild";

export default () =>
	({
		name: "@nova/esbuild-plugin-perf",
		setup: (build) => {
			let startTime: number | null;

			build.onStart(() => {
				startTime = Date.now();
			});

			build.onEnd(() => {
				const endTime = Date.now();
				const duration = endTime - startTime!;

				console.log(`  esbuild: ${(duration / 1000).toFixed(2)}s`);
			});
		},
	} as Plugin);
