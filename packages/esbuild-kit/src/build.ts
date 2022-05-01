#!/usr/bin/env node
import { build, type Plugin } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import { entryName, findConfig, run } from "./base/index.js";
import {
	cssModulesPlugin,
	externalsPlugin,
	perfPlugin,
	sassPlugin,
	svgrPlugin,
} from "./plugins/index.js";

const config = await findConfig();

const {
	entryPoint = "./src/index.ts",
	outDir = "./build/",

	jsx = "react",
	linkSourceMaps = true,
	pure,
} = config;

const skipTsc = config.features?.tsc === false || process.argv.includes("--noCheck");
const watch = process.argv.includes("-w");

// Needs to be in place early for type checking
await fs.copyFile(
	new URL("../static/build.d.ts", import.meta.url),
	path.join(process.cwd(), "./build.d.ts"),
);

console.log("Bundling...");
await build({
	entryPoints: [entryPoint],
	bundle: true,
	ignoreAnnotations: true,
	format: "esm",
	jsx: jsx === "react" ? "transform" : "preserve",
	outbase: "./src/",
	outdir: path.join(outDir, "./dist/"),
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

void fs.writeFile(
	path.join(process.cwd(), outDir, "./index.js"),
	// When `pure`, the default entry point should only include JavaScript.
	// When not, it should include JavaScript and CSS
	(await fs.readFile(new URL(`../static/${pure ? "js" : "index"}.js`, import.meta.url)))
		.toString("utf-8")
		.replaceAll("index", entryName(entryPoint)),
);

void fs.writeFile(
	path.join(process.cwd(), outDir, "./index.d.ts"),
	// When `pure`, the default entry point should only include JavaScript.
	// When not, it should include JavaScript and CSS
	(await fs.readFile(new URL(`../static/index.d.ts`, import.meta.url)))
		.toString("utf-8")
		.replaceAll("index", entryName(entryPoint)),
);

void fs.writeFile(
	path.join(process.cwd(), outDir, "./css.js"),
	(await fs.readFile(new URL("../static/css.js", import.meta.url)))
		.toString("utf-8")
		.replaceAll("index", entryName(entryPoint)),
);

await fs.copyFile(
	new URL("../static/css.d.ts", import.meta.url),
	path.join(process.cwd(), outDir, "/css.d.ts"),
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
		path.join(outDir, "./types/"),
		"--rootDir",
		"./src/",
		watch && ["-w", "--preserveWatchOutput"],
	]);
}
