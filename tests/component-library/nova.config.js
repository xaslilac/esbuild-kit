const path = require("path");

module.exports = {
	export: "./src/main.ts",
	features: {
		svgr: true,
		sass: {
			loadPaths: [path.join(__dirname, "./src/shared")],
		},
	},
};
