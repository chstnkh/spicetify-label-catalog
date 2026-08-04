// Captures whatever the custom app throws while mounting.
(async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const captured = [];

	const originalError = console.error;
	console.error = function (...args) {
		captured.push(args.map((a) => (a && a.stack ? a.stack : String(a))).join(" | ").slice(0, 700));
		return originalError.apply(this, args);
	};
	const onError = (e) => captured.push("window.error: " + (e.error?.stack || e.message));
	window.addEventListener("error", onError);

	Spicetify.Platform.History.push("/collection");
	await sleep(2000);
	Spicetify.Platform.History.push("/label-catalog?label=" + encodeURIComponent("M-Plant"));
	await sleep(9000);

	console.error = originalError;
	window.removeEventListener("error", onError);

	return {
		mounted: !!document.querySelector(".label-catalog"),
		rows: document.querySelectorAll(".release-row").length,
		captured: captured.slice(0, 4),
	};
})();
