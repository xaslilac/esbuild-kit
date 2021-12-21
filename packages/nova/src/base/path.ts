import * as path from "path";

export function entryName(entryPath: string) {
	const basename = path.basename(entryPath);
	const i = basename.lastIndexOf(".");
	return basename.slice(0, i < 0 ? undefined : i);
}
