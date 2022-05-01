import type { OnResolveArgs } from "esbuild";
import * as path from "path";

export function getPath(args: OnResolveArgs) {
	return path.resolve(args.resolveDir, args.path);
}
