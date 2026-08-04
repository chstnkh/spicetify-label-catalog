// Verifies that the sticky header names the release actually under it.
(async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	Spicetify.Platform.History.push("/collection");
	await sleep(1500);
	Spicetify.Platform.History.push("/label-catalog?label=" + encodeURIComponent("M-Plant"));
	for (let i = 0; i < 30; i++) {
		await sleep(2000);
		const text = document.querySelector(".label-catalog__count")?.textContent || "";
		if (text && !/…/.test(text)) break;
	}
	await sleep(1200);

	const scrollers = [...document.querySelectorAll("div")].filter(
		(n) => n.scrollHeight > n.clientHeight + 200 && n.clientHeight > 300
	);
	const scroller = scrollers.sort((a, b) => b.clientHeight - a.clientHeight)[0];

	const samples = [];
	for (const top of [900, 1600, 2400]) {
		scroller.scrollTop = top;
		// Let the rAF-throttled measurement settle before reading.
		await sleep(1200);

		const line = 64 + 56;
		const sections = [...document.querySelectorAll("[data-release-uri]")].map((s) => ({
			name: s.dataset.releaseName,
			top: Math.round(s.getBoundingClientRect().top),
			bottom: Math.round(s.getBoundingClientRect().bottom),
		}));
		const containing = sections.find((s) => s.top <= line && s.bottom > line);

		samples.push({
			scrollTop: top,
			stickyShows: document.querySelector(".label-catalog__nowbar-title")?.textContent ?? null,
			sectionUnderLine: containing?.name ?? null,
			matches: (document.querySelector(".label-catalog__nowbar-title")?.textContent ?? null) === (containing?.name ?? null),
		});
	}

	return samples;
})();
