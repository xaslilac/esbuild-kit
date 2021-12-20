#!/usr/bin/env node
import { build, Plugin } from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";
import {
	is,
	$anyobject,
	$array,
	$boolean,
	$maybe,
	$object,
	$string,
	Schema,
} from "succulent";

import { run } from "./base/run.js";
import cssModulesPlugin from "./plugins/cssModules.js";
import externalsPlugin from "./plugins/externals.js";
import sassPlugin from "./plugins/sass.js";
import svgrPlugin from "./plugins/svgr.js";

const configSchema = $object({
	export: $string,
	features: $maybe(
		$object({
			svgr: $maybe($boolean),
		}),
	),
	esbuildPlugins: $maybe($array($anyobject)),
});

async function findConfig(
	configPath: string = process.cwd(),
): Promise<Schema.Unwrap<typeof configSchema>> {
	try {
		const { default: config } = await import(path.join(configPath, "nova.config.js"));

		if (!is(config, configSchema)) {
			throw new Error("Failed to validate nova.config.js");
		}

		return config;
	} catch (e) {
		const nextConfigPath = path.join(configPath, "..");
		if (nextConfigPath !== configPath) {
			return findConfig(nextConfigPath);
		}

		throw new Error("Failed to resolve config");
	}
}

const start = Date.now();

// console.time("- config");
console.log("[1/3] Building config...");

const config = await findConfig();
console.log(config);
// console.timeEnd("- config");

// console.time("- esbuild");
console.log("[2/3] Bundling...");

await build({
	entryPoints: ["./src/main.ts"],
	bundle: true,
	format: "esm",
	// jsx: "preserve",
	// outdir: "./.nova/esbuild/",
	outdir: "./target/",
	plugins: [
		cssModulesPlugin,
		externalsPlugin,
		sassPlugin,
		config.features?.svgr && svgrPlugin,
		config.esbuildPlugins,
	]
		.filter(Boolean)
		.flat(1) as Plugin[],
	sourcemap: "external",
});
// console.timeEnd("- esbuild");

// console.time("- tsc");
console.log("[3/3] Checking types...");

await run("tsc", [
	"-p",
	".",
	"--emitDeclarationOnly",
	"--declarationMap",
	"--declarationDir",
	"./target",
	"--rootDir",
	"./src",
]);
// console.timeEnd("- tsc");

console.log("[4/4] Preparing...");

await fs.copyFile(
	new URL("../static/css.d.ts", import.meta.url),
	path.join(process.cwd(), "./target/css.d.ts"),
);

await fs.copyFile(
	new URL("../static/index.js", import.meta.url),
	path.join(process.cwd(), "./target/index.js"),
);

const end = Date.now();
const duration = end - start;

console.log(`🌺 Completed in ${(duration / 1000).toFixed(2)}s`);
