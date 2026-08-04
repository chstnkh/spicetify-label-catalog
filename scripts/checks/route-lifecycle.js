// Verifies the extension's route takeover mounts, cleans up on navigation away,
// and remounts on return. Spotify leaves the injected node in place when you
// navigate off an unknown route, so the cleanup is the extension's job.
(async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const H = Spicetify.Platform.History;
	const mounted = () => !!document.querySelector(".label-catalog");
	const out = { customAppsInstalled: Spicetify.Config?.custom_apps ?? [] };

	const goCatalogue = async (label) => {
		H.push("/label-catalog?label=" + encodeURIComponent(label));
		for (let i = 0; i < 25; i++) {
			await sleep(1000);
			if (mounted()) break;
		}
	};

	H.push("/collection");
	await sleep(2000);

	await goCatalogue("M-Plant");
	out.mounted = mounted();
	out.title = document.querySelector(".label-catalog__title")?.textContent ?? null;

	// Leaving must remove it — otherwise it leaks onto unrelated pages.
	H.push("/collection");
	await sleep(3000);
	out.cleanedUpOnLeave = !mounted();
	out.leakedElsewhere = document.querySelectorAll(".label-catalog").length;

	// Coming back must rebuild it, with the new label.
	await goCatalogue("Text Records");
	out.remounted = mounted();
	out.remountTitle = document.querySelector(".label-catalog__title")?.textContent ?? null;

	// A different album page must still get its link.
	H.push("/album/1yQ8NRBUA79qGGt3MJHezC"); // Biology 004 VA, Biorecordings
	for (let i = 0; i < 30; i++) {
		await sleep(500);
		if (document.body.innerText.includes("Biology 004")) break;
	}
	await sleep(2500);
	out.linkAfterCatalogue = document.querySelector("[data-label-link] a")?.textContent ?? null;
	out.catalogueGoneOnAlbum = !mounted();

	return out;
})();
