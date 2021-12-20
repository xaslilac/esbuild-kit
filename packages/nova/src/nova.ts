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

const start = Date.now();

// console.time("- config");
console.log("[1/3] Building config...");

const config = await findConfig();
console.log(config);
// console.timeEnd("- config");

// console.time("- esbuild");
console.log("[2/3] Bundling...");

const {
	export: entryPoint = "./src/main.ts",
	jsx = "react",
	outDir = "./target",
} = config;

await build({
	entryPoints: [entryPoint],
	bundle: true,
	format: "esm",
	jsx: jsx === "react" ? "transform" : "preserve",
	outdir: outDir,
	watch: process.argv.includes("-w"),
	plugins: [
		cssModulesPlugin(),
		externalsPlugin(),
		perfPlugin(),
		sassPlugin({ sassOptions: config.features?.sass ?? undefined }),
		config.features?.svgr && svgrPlugin(),
		config.esbuildPlugins,
	]
		.filter(Boolean)
		.flat(1) as Plugin[],
	sourcemap: "external",
});
// console.timeEnd("- esbuild");

const skipTsc = config.features?.tsc === false || process.argv.includes("--noCheck");

// console.time("- tsc");
console.log("[3/3] Checking types...", skipTsc ? "(skipping)" : "");

if (!skipTsc) {
	await run("tsc", [
		"-p",
		".",
		"--emitDeclarationOnly",
		"--declarationMap",
		"--declarationDir",
		outDir,
		"--rootDir",
		"./src",
	]);
}
// console.timeEnd("- tsc");

console.log("[4/4] Preparing...");

await fs.copyFile(
	new URL("../static/css.d.ts", import.meta.url),
	path.join(process.cwd(), "./target/css.d.ts"),
);

await fs.copyFile(
	new URL("../static/index.js", import.meta.url),
	path.join(process.cwd(), outDir, "./index.js"),
);

await fs.copyFile(
	new URL("../static/nova.d.ts", import.meta.url),
	path.join(process.cwd(), "./nova.d.ts"),
);
