import * as path from "path";
import {
	is,
	$anyobject,
	$array,
	$boolean,
	$maybe,
	$object,
	$optional,
	$string,
	Schema,
	union,
} from "succulent";

const configSchema = $object({
	export: $string,
	outDir: $optional($string),

	jsx: $maybe(union("react", "preserve")),

	features: $maybe(
		$object({
			sass: $maybe($anyobject),
			svgr: $maybe($boolean),
			tsc: $maybe($boolean),
		}),
	),
	esbuildPlugins: $maybe($array($anyobject)),
});

export async function findConfig(
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
