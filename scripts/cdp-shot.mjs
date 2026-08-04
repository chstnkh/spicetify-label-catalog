// Screenshots the client's renderer, optionally after running a setup script and
// hovering a selector — hover states can only be captured with a real pointer
// event, CSS :hover cannot be forced from page JS.
//
// Usage: node scripts/cdp-shot.mjs <out.png> [setup.js] [hoverSelector] [port]
import { readFileSync, writeFileSync } from "node:fs";

const [outPath, setupFile, hoverSelector, portArg] = process.argv.slice(2);
const port = portArg || 9222;

const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((t) => t.type === "page" && t.url.includes("xpui"));
if (!page) {
	console.error("no xpui page target");
	process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();

function send(method, params = {}) {
	const id = nextId++;
	ws.send(JSON.stringify({ id, method, params }));
	return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

ws.onmessage = (event) => {
	const message = JSON.parse(event.data);
	const entry = pending.get(message.id);
	if (!entry) return;
	pending.delete(message.id);
	if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
	else entry.resolve(message.result);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await new Promise((resolve) => (ws.onopen = resolve));

// Width matters: the controls row behaves differently once the viewport narrows,
// so checks should be able to reproduce the user's actual window.
await send("Emulation.setDeviceMetricsOverride", {
	width: Number(process.env.SHOT_WIDTH || 1440),
	height: Number(process.env.SHOT_HEIGHT || 900),
	deviceScaleFactor: 2,
	mobile: false,
});

if (setupFile) {
	await send("Runtime.evaluate", {
		expression: readFileSync(setupFile, "utf8"),
		awaitPromise: true,
		returnByValue: true,
		timeout: 115000,
	});
}
await sleep(2000);

if (hoverSelector) {
	const box = await send("Runtime.evaluate", {
		expression: `(() => {
			const el = document.querySelector(${JSON.stringify(hoverSelector)});
			if (!el) return null;
			const r = el.getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
		})()`,
		returnByValue: true,
	});
	const point = box?.result?.value;
	if (!point) {
		console.error(`hover target not found: ${hoverSelector}`);
	} else {
		await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point.x, y: point.y, buttons: 0 });
		await sleep(900);
	}
}

const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(outPath, Buffer.from(shot.data, "base64"));
await send("Emulation.clearDeviceMetricsOverride");
console.log("wrote", outPath);
ws.close();
