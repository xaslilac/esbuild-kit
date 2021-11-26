import { UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default {
	plugins: [tsconfigPaths({ root: ".." })],

	root: "./src",
	publicDir: "../public",

	define: {
		__DEV__: JSON.stringify(process.env["NODE_ENV"] === "production"),
	},

	server: {
		port: 5000,
	},

	build: {
		outDir: "../target",
	},
} as UserConfig;
