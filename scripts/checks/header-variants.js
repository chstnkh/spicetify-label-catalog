// The release header comes in more than one shape and the label link has to land
// correctly in all of them. Regressions caught here before:
//   - multi-artist releases had the label wedged between the first two names
//   - compilations credit an unlinked "Various Artists", and anchoring on
//     `a[href^="/artist/"]` skipped them entirely
(async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const H = Spicetify.Platform.History;

	const cases = [
		{ name: "single artist", id: "6MWLChMsL3lmoyBzmH5n7I", expectLabel: "M-Plant", marker: "Red Passion II - B" },
		{ name: "various artists", id: "1yQ8NRBUA79qGGt3MJHezC", expectLabel: "Biorecordings", marker: "Biology 004" },
		{ name: "two artists", id: "5n192ghquuwEFORZEtNyLg", expectLabel: null, marker: "Hundred Days Off" },
	];

	const results = [];
	for (const testCase of cases) {
		H.push("/collection");
		await sleep(1800);
		H.push(`/album/${testCase.id}`);
		for (let i = 0; i < 40; i++) {
			await sleep(500);
			if (document.body.innerText.includes(testCase.marker)) break;
		}
		await sleep(3000);

		const row = document.querySelector(".main-entityHeader-metaData");
		const text = row ? (row.innerText || "").replace(/\s+/g, " ") : null;
		const link = row?.querySelector("[data-label-link] a")?.textContent ?? null;

		// The label must sit after every credit and before the year.
		const order = text && link ? new RegExp(`${escapeRegExp(link)}\\s*•\\s*\\d{4}`).test(text) : false;

		results.push({
			case: testCase.name,
			header: text,
			link,
			labelBeforeYear: order,
			ok: Boolean(link) && order && (!testCase.expectLabel || link === testCase.expectLabel),
		});
	}

	function escapeRegExp(value) {
		return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	return { allPassed: results.every((r) => r.ok), results };
})();
