# NOVA

Nova is a build system for UI libraries for the web.

-   Fast.
-   First class CSS, CSS modules, SCSS, and SCSS modules support.
-   TypeScript support, including type checking.
-   Support for customizable import resolution.
-   Works with Storybook (in progess)

### Configuration

#### package.json

```json
{
	"module": "./target/index.js",
	"types": "./target/index.d.ts",
	"exports": {
		".": {
			"import": "./target/index.js",
			"types": "./target/index.d.ts"
		},
		"./pure": {
			"import": "./target/index.pure.js",
			"types": "./target/index.d.ts"
		},
		"./css": {
			"import": "./target/index.css.js",
			"types": "./target/index.css.d.ts"
		}
	}
}
```

#### tsconfig.json

```json
{
	"include": ["./nova.d.ts", "./src/**/*"]
}
```

#### nova.config.js

```javascript
module.exports = {
	export: "./src/main.ts",
};
```
