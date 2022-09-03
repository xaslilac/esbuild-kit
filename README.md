<h1 align="center">
<img alt="esbuild-kit" src="https://cdn.mckayla.cloud/-/760de563e75a4129b29564d2729597be/blue.webp" height="200" />
<br />
esbuild-kit
</h1>

Provides everything you need to build your project with ESBuild.

-   First class CSS, SCSS, and CSS modules
-   TypeScript support, including type checking
-   Sane defaults

```javascript
// build.mjs
import b from "esbuild-kit";

b({
	entryPoint: "./src/index.js",
	formats: ["cjs", "esm"],
	outdir: "./build/",
});
```

### Motivation

-   Most of the build tools we've been using for web development are dreadfully slow,
    often hard to configure, tend to be walled gardens that lock you in, and even then you
    often can't get them to do _quite_ what you really want.
-   Newer tools are coming out that are fast, but incomplete.
-   ESBuild and SWC are both great, but are also each missing their own sets of features.
-   Tools like Vite and Snowpack very heavily target the browser, and aren't very well
    suited for "building libraries for use in things that will _then_ target the browser."
-   Bundling images and CSS into your JavaScript bundle is a footgun, and yet many tools
    insist on doing it.
