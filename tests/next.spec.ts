import { expect, test } from "@playwright/test";
import { spawn } from "child_process";

let proc = null;

test.beforeAll(() => {
	proc = spawn("npm", ["run", "dev", "-w", "@nova/next-test"], {
		stdio: "inherit",
	});

	return new Promise<void>((resolve) => {
		setTimeout(resolve, 5000);
	});
});

test("css is loading!", async ({ page }) => {
	await page.goto("http://localhost:3000");
	const example = page.locator(".row");

	// example.first

	expect(example.first()).toHaveCSS("background-color", "red");
});

test.afterAll(() => {
	proc?.kill();
});
