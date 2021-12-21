#!/usr/bin/env node
import { build, Plugin } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import { entryName } from "./base/path.js";
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
	outDir = "./target",

	jsx = "react",
	linkSourceMaps = true,
	pure,
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
	outbase: "./src",
	outdir: path.join(outDir, "./build"),
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

fs.writeFile(
	path.join(process.cwd(), outDir, pure ? "./index.js" : "./index.pure.js"),
	(await fs.readFile(new URL("../static/index.pure.js", import.meta.url)))
		.toString("utf-8")
		.replaceAll("main", entryName(entryPoint)),
);

if (!pure) {
	fs.writeFile(
		path.join(process.cwd(), outDir, "./index.js"),
		(await fs.readFile(new URL("../static/index.js", import.meta.url)))
			.toString("utf-8")
			.replaceAll("main", entryName(entryPoint)),
	);
}

fs.writeFile(
	path.join(process.cwd(), outDir, "./index.d.ts"),
	(await fs.readFile(new URL("../static/index.d.ts", import.meta.url)))
		.toString("utf-8")
		.replaceAll("main", entryName(entryPoint)),
);

fs.writeFile(
	path.join(process.cwd(), outDir, "./index.css.js"),
	(await fs.readFile(new URL("../static/index.css.js", import.meta.url)))
		.toString("utf-8")
		.replaceAll("main", entryName(entryPoint)),
);

await fs.copyFile(
	new URL("../static/index.css.d.ts", import.meta.url),
	path.join(process.cwd(), outDir, "/index.css.d.ts"),
);

if (!skipTsc) {
	console.log("Checking types...");
	// This await...kind of makes it a bad idea to put anything after this
	// (particularly when watch mode is involved)
	await run("tsc", [
		"-p",
		".",
		"--emitDeclarationOnly",
		"--declarationMap",
		"--declarationDir",
		path.join(outDir, "./types"),
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
