module.exports = {
	core: { builder: "webpack5" },
	stories: ["../src/**/*.story.mdx", "../src/**/*.story.@(js|jsx|ts|tsx)"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/preset-scss",
	],
};
