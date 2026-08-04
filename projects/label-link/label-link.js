/**
 * Adds a clickable record label to the release page header, between the artist
 * and the release year, pointing at the Label catalogue custom app.
 *
 * Also records the `searchAlbums` persisted-query hash whenever the client runs
 * its own album search. Those hashes are build-specific, so this is what keeps
 * the catalogue working across Spotify updates without shipping a new build.
 */
(function labelLink() {
	const HASH_STORAGE_KEY = "label-catalog:searchAlbums-hash";
	const MARKER = "data-label-link";
	const META_ROW = ".main-entityHeader-metaData";

	// Check for the method, not just the namespace: after an in-place page reload
	// `Spicetify.GraphQL` exists while `Request` is still unbound, and starting
	// then leaves every label lookup throwing.
	if (!Spicetify?.Platform?.History || typeof Spicetify?.GraphQL?.Request !== "function") {
		setTimeout(labelLink, 300);
		return;
	}

	/**
	 * Bumped on every navigation. An in-flight label lookup compares against it
	 * before touching the DOM, so a slow response can never paint the previous
	 * album's label onto the page you are now looking at.
	 */
	let navigationToken = 0;

	injectStyles();
	captureSearchAlbumsHash();
	Spicetify.Platform.History.listen(onNavigate);
	onNavigate();

	function injectStyles() {
		if (document.getElementById("label-link-styles")) return;
		const style = document.createElement("style");
		style.id = "label-link-styles";
		style.textContent = `
			/* Reads as a link but stays subdued, so it does not compete with the
			   bold artist credits next to it. */
			.label-link a {
				color: var(--text-subdued, #a7a7a7);
				text-decoration: none;
			}
			.label-link a:hover,
			.label-link a:focus-visible {
				color: var(--text-base, #fff);
				text-decoration: underline;
			}

			/* Spicetify gives every custom app a nav button. Ours would open the
			   catalogue with no label selected, which is a dead end, so hide it —
			   the page is reached from the label link on a release instead.
			   The selector follows displayName in label-catalog/src/settings.json. */
			.spicetify-sc-scroller button[aria-label="Label"] {
				display: none;
			}

			/* Spotify prints the trailing metadata block with a "•" ::before while
			   also emitting a real separator span before it, and relies on a
			   class-scoped rule to hide one of them. Spicetify rewrites those
			   generated class names, the rule stops matching, and an extra bullet
			   appears — visible even with no extensions loaded. Drop the duplicate. */
			.main-entityHeader-metaData > span + .main-entityHeader-metaDataText::before {
				content: none;
			}
		`;
		document.head.appendChild(style);
	}

	/** Watches the client's own traffic so the hash stays current by itself. */
	function captureSearchAlbumsHash() {
		const original = window.fetch;
		window.fetch = function (input, init) {
			try {
				const body = init?.body;
				if (typeof body === "string" && body.includes('"searchAlbums"')) {
					const hash = JSON.parse(body)?.extensions?.persistedQuery?.sha256Hash;
					if (hash && hash !== localStorage.getItem(HASH_STORAGE_KEY)) {
						localStorage.setItem(HASH_STORAGE_KEY, hash);
					}
				}
			} catch {
				/* never let instrumentation break a real request */
			}
			return original.apply(this, arguments);
		};
	}

	function albumIdFromPath() {
		const match = (Spicetify.Platform.History.location?.pathname || "").match(/^\/album\/([A-Za-z0-9]+)/);
		return match ? match[1] : null;
	}

	function onNavigate() {
		const token = ++navigationToken;
		// Anything already on screen belongs to the page we just left.
		document.querySelectorAll(`[${MARKER}]`).forEach((node) => node.remove());

		const albumId = albumIdFromPath();
		if (!albumId) return;

		// The header renders asynchronously; poll briefly rather than racing it.
		let attempts = 0;
		const timer = setInterval(() => {
			if (token !== navigationToken || ++attempts > 40) {
				clearInterval(timer);
				return;
			}
			const row = document.querySelector(META_ROW);
			if (!row || row.children.length < 2) return;
			clearInterval(timer);
			inject(row, albumId, token);
		}, 250);
	}

	async function inject(row, albumId, token) {
		if (row.querySelector(`[${MARKER}]`)) return;

		let label;
		try {
			const response = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.getAlbum, {
				uri: `spotify:album:${albumId}`,
				locale: "",
				offset: 0,
				limit: 1,
			});
			label = response?.data?.albumUnion?.label;
		} catch (error) {
			console.error("[label-link] could not resolve label", error);
			return;
		}

		// The user may have navigated on while that request was in flight.
		if (!label || token !== navigationToken || !row.isConnected) return;
		if (row.querySelector(`[${MARKER}]`)) return;

		const children = [...row.children];

		// A release can credit several artists, each its own node with Spotify's
		// own separators between them. The label belongs after the whole credit
		// list, not wedged between the first two names.
		const artistNodes = children.filter((node) => node.querySelector('a[href^="/artist/"]'));
		const lastArtist = artistNodes[artistNodes.length - 1];
		const separator = children.find((node) => (node.textContent || "").trim() === "•");
		if (!lastArtist || !separator) return;

		// Cloning live nodes inherits Spotify's typography classes, which are
		// generated per build and would rot if hardcoded. Two constraints:
		//  - the label must NOT be cloned from a separator, because Spotify
		//    collapses runs of them via `.sep:has(+ .sep) { display: none }`,
		//    which silently hid the injected nodes entirely;
		//  - it should be cloned from the artist's own span so the label reads as
		//    a peer link in the credit line rather than as subdued metadata.
		const artistLink = lastArtist.querySelector('a[href^="/artist/"]');
		const artistSpan = artistLink.closest("span") || artistLink.parentElement;

		const ownSeparator = separator.cloneNode(true);
		ownSeparator.setAttribute(MARKER, albumId);

		// Cloned from the artist span because that node is known to survive
		// Spotify's separator-collapsing rules, then stepped down from the bold
		// credit weight to the subdued metadata weight used by the year.
		const holder = artistSpan.cloneNode(false);
		holder.setAttribute(MARKER, albumId);
		holder.classList.remove("encore-text-body-small-bold");
		holder.classList.add("encore-text-body-small", "encore-internal-color-text-subdued", "label-link");

		const link = document.createElement("a");
		link.textContent = label;
		link.href = `/label-catalog?label=${encodeURIComponent(label)}`;
		link.addEventListener("click", (event) => {
			event.preventDefault();
			Spicetify.Platform.History.push(`/label-catalog?label=${encodeURIComponent(label)}`);
		});
		holder.appendChild(link);

		lastArtist.after(ownSeparator);
		ownSeparator.after(holder);
	}
})();
