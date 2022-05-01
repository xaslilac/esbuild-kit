const path = require("path");

module.exports = {
	entryPoint: "./src/index.ts",
	pure: true,
	features: {
		svgr: true,
		sass: {
			loadPaths: [path.join(__dirname, "./src/shared")],
		},
	},
};
