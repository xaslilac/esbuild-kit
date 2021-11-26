import { spawn } from "child_process";

type Falsey = undefined | null | false;

export function run(name: string, args: Array<string | Falsey | string[]> = []) {
	const proc = spawn(name, args.filter(Boolean).flat(1) as string[], {
		stdio: "inherit",
	});

	process.on("exit", () => {
		// proc.disconnect();
		proc.kill();
	});

	return new Promise<number>((resolve, reject) =>
		proc.on("close", (exitCode) => {
			if (exitCode == null) {
				reject(new Error(`Received an exit code of null from '${name}'`));
				return;
			}

			resolve(exitCode);
		}),
	);
}
