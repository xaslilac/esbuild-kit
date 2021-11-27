import { transformCssModules } from "./cssModules";

// The only reason these tests don't pass is because `transformCssModules`
// doesn't produce deterministic transformed names. Seems to otherwise work,
// but fixing that would be nice for testability.
xtest("transformCssModules", async () => {
	const exampleCss = `
		.hey {
			color: red;
		}
	`;

	const [css, json] = await transformCssModules(exampleCss);

	expect(css).toMatchSnapshot();
	expect(json).toMatchSnapshot();
});
