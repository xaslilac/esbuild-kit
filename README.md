<h1 align="center"><img alt="Nova" src="media/nova.svg" height="200" /></h1>

[![version](https://mckayla.dev/badge/v/nova-build/e57599)](https://npmjs.org/package/nova-build)

Nova is a fast system for UI libraries for the web.

-   Fast.
-   First class CSS, SCSS, and CSS modules.
-   TypeScript support, including type checking.
-   Support for tsconfig.json and jsconfig.json paths.
-   Works with Storybook (in progess)

### Motivation

-   Most of the build systems we've been using for front-end web development are dreadfully
    slow, often hard to configure, and even then you often can't get them to do _quite_ what
    you really want.
-   Newer tools are coming out that are fast, but incomplete.
    -   ESBuild and SWC are both great, but are also each missing their own sets of features.
    -   Tools like Vite and Snowpack very heavily target the browser, and aren't very well
        suited for "building libraries for use in things that will _then_ target the browser."
-   Bundling images and CSS into your JavaScript bundle is a footgun, and yet many tools
    insist on doing it.

### How is Nova different?

-   Nova outputs modern JavaScript that can be tree shaken and polyfilled by your app build
    system. Your library shouldn't be compiled down to ES5. If you need to target ES5, that
    targeting should all be handled in a single build step: building your app.
-   Nova outputs your CSS separately, in a way that can be understood by later build systems.

While I'd definitely still consider Nova to be beta-quality, it's used in production by a
couple different projects to great success. It's mostly the development experience that
needs some improvement. SCSS compilation is much flakier than it should be, and overall
it's a little slower than I would like, but it can handle very large libraries in a couple
seconds.
