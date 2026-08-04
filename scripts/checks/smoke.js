// End-to-end smoke check: header link on a release, then the catalogue page.
// Run with: node scripts/cdp-eval.mjs scripts/checks/smoke.js
(async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const out = {};

	out.spicetify = Spicetify?.Config?.version;
	out.extensions = Spicetify?.Config?.extensions;
	out.customApps = Spicetify?.Config?.custom_apps;
	out.graphQlReady = typeof Spicetify?.GraphQL?.Request === "function";

	// A release with a well-known label.
	Spicetify.Platform.History.push("/album/6MWLChMsL3lmoyBzmH5n7I"); // Red Passion II - B, M-Plant
	for (let i = 0; i < 40; i++) {
		await sleep(500);
		if (document.body.innerText.includes("Red Passion II - B")) break;
	}
	await sleep(3000);

	const row = document.querySelector(".main-entityHeader-metaData");
	const link = row?.querySelector("[data-label-link] a");
	out.header = row ? (row.innerText || "").replace(/\s+/g, " ") : null;
	out.link = link ? { text: link.textContent, href: link.getAttribute("href") } : null;

	// Follow it through to the catalogue.
	if (link) {
		link.click();
		for (let i = 0; i < 40; i++) {
			await sleep(2000);
			const label = document.querySelector(".label-catalog__count")?.textContent || "";
			if (label && !/…/.test(label)) break;
		}
		const root = document.querySelector(".label-catalog");
		out.catalogue = {
			title: root?.querySelector(".label-catalog__title")?.textContent,
			count: root?.querySelector(".label-catalog__count")?.textContent?.replace(/\s+/g, " "),
			rows: root?.querySelectorAll(".release-row").length ?? 0,
			notice: root?.querySelector(".label-catalog__notice")?.textContent ?? null,
		};
	}

	return out;
})();
