// Evaluates an expression inside the client's renderer over the DevTools protocol.
// The client must be running with a debug port: `DEBUG_PORT=9222 npm start`.
//
// Usage: node scripts/cdp-eval.mjs <file-with-expression> [port]
import { readFileSync } from "node:fs";

const expression = readFileSync(process.argv[2], "utf8");
const port = process.argv[3] || 9222;

const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find((t) => t.type === "page" && t.url.includes("xpui"));
if (!page) {
	console.error("no xpui page target — is the client running with a debug port?");
	process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
const done = new Promise((resolve, reject) => {
	const timer = setTimeout(() => reject(new Error("timed out after 120s")), 120000);
	ws.onopen = () =>
		ws.send(
			JSON.stringify({
				id: 1,
				method: "Runtime.evaluate",
				params: { expression, awaitPromise: true, returnByValue: true, timeout: 115000 },
			})
		);
	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		if (message.id !== 1) return;
		clearTimeout(timer);
		if (message.result?.exceptionDetails) reject(new Error(JSON.stringify(message.result.exceptionDetails, null, 2)));
		else resolve(message.result?.result?.value);
		ws.close();
	};
	ws.onerror = (e) => reject(new Error(`websocket error: ${e.message}`));
});

try {
	console.log(JSON.stringify(await done, null, 2));
} catch (error) {
	console.error("FAILED:", error.message);
	process.exit(1);
}
