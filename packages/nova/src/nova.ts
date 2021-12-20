#!/usr/bin/env node
import { build, Plugin } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import { run } from "./base/run.js";
import { findConfig } from "./config.js";
import cssModulesPlugin from "./plugins/cssModules.js";
import externalsPlugin from "./plugins/externals.js";
import perfPlugin from "./plugins/perf.js";
import sassPlugin from "./plugins/sass.js";
import svgrPlugin from "./plugins/svgr.js";

const startTime = Date.now();

const config = await findConfig();

const {
	export: entryPoint = "./src/main.ts",
	jsx = "react",
	outDir = "./target",
	linkSourceMaps = true,
} = config;

const skipTsc = config.features?.tsc === false || process.argv.includes("--noCheck");
const watch = process.argv.includes("-w");

// Needs to be in place early for type checking
await fs.copyFile(
	new URL("../static/nova.d.ts", import.meta.url),
	path.join(process.cwd(), "./nova.d.ts"),
);

console.log("Bundling...");
await build({
	entryPoints: [entryPoint],
	bundle: true,
	format: "esm",
	jsx: jsx === "react" ? "transform" : "preserve",
	outdir: outDir,
	watch,
	plugins: [
		cssModulesPlugin(),
		externalsPlugin(),
		watch && perfPlugin(),
		sassPlugin({ sassOptions: config.features?.sass ?? undefined }),
		config.features?.svgr && svgrPlugin(),
		config.esbuildPlugins,
	]
		.filter(Boolean)
		.flat(1) as Plugin[],
	sourcemap: linkSourceMaps ? true : "external",
});

await fs.copyFile(
	new URL("../static/main.css.d.ts", import.meta.url),
	path.join(process.cwd(), "./target/main.css.d.ts"),
);

await fs.copyFile(
	new URL("../static/index.js", import.meta.url),
	path.join(process.cwd(), outDir, "./index.js"),
);

if (!skipTsc) {
	console.log("Checking types...");
	run("tsc", [
		"-p",
		".",
		"--emitDeclarationOnly",
		"--declarationMap",
		"--declarationDir",
		outDir,
		"--rootDir",
		"./src",
		watch && ["-w", "--preserveWatchOutput"],
	]);
}

const endTime = Date.now();
const duration = endTime - startTime!;

if (!watch) {
	console.log(`🌺 Completed in ${(duration / 1000).toFixed(2)}s`);
}
