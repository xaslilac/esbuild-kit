import * as path from "path";
import {
	check,
	Type,
	union,
	$anyobject,
	$array,
	$boolean,
	$maybe,
	$object,
	$optional,
	$string,
} from "succulent";

interface Config extends Type<typeof $Config> {}
const $Config = $object({
	entryPoint: $string,
	outDir: $optional($string),

	jsx: $optional(union("react", "preserve")),
	linkSourceMaps: $optional($boolean),
	pure: $optional($boolean),

	features: $optional(
		$object({
			sass: $maybe($anyobject),
			svgr: $maybe($boolean),
			tsc: $maybe($boolean),
		}),
	),
	esbuildPlugins: $maybe($array($anyobject)),
});

export async function findConfig(configPath: string = process.cwd()): Promise<Config> {
	try {
		// really wish you'd just shut the fuck up sometimes
		// eslint-disable-next-line
		const { default: config } = await import(
			path.join(configPath, "build.config.js")
		);

		return check(config, $Config);
	} catch (cause) {
		// @ts-expect-error - TypeScript doesn't have types for cause yet
		throw new Error("Failed to resolve config", { cause });
	}
}
