/**
 * Puts a clickable record label in the release header, between the artist
 * credits and the year.
 *
 * Also records the `searchAlbums` persisted-query hash whenever the client runs
 * its own album search. Those hashes are build-specific, so this is what keeps
 * the catalogue working across Spotify updates without shipping a new build.
 */

import { albumIdFromPath, catalogueHref, extractSearchAlbumsHash, findHeaderAnchor } from "./lib";

export { ROUTE, catalogueHref } from "./lib";

const HASH_STORAGE_KEY = "label-catalog:searchAlbums-hash";
const MARKER = "data-label-link";
const META_ROW = ".main-entityHeader-metaData";

export function injectStyles(): void {
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
		   the page is reached from the label link on a release instead. */
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

export function startLabelLink(): void {
	/**
	 * Bumped on every navigation. An in-flight label lookup compares against it
	 * before touching the DOM, so a slow response can never paint the previous
	 * album's label onto the page you are now looking at.
	 */
	let navigationToken = 0;

	captureSearchAlbumsHash();
	Spicetify.Platform.History.listen(onNavigate);
	onNavigate();

	/** Watches the client's own traffic so the hash stays current by itself. */
	function captureSearchAlbumsHash(): void {
		const original = window.fetch;
		window.fetch = function (this: unknown, ...args: Parameters<typeof fetch>) {
			try {
				const hash = extractSearchAlbumsHash(args[1]?.body);
				if (hash && hash !== localStorage.getItem(HASH_STORAGE_KEY)) {
					localStorage.setItem(HASH_STORAGE_KEY, hash);
				}
			} catch {
				/* never let instrumentation break a real request */
			}
			return original.apply(this as never, args);
		};
	}

	function onNavigate(): void {
		const token = ++navigationToken;
		// Anything already on screen belongs to the page we just left.
		document.querySelectorAll(`[${MARKER}]`).forEach((node) => node.remove());

		const albumId = albumIdFromPath(Spicetify.Platform.History.location?.pathname || "");
		if (!albumId) return;

		// The header renders asynchronously; poll briefly rather than racing it.
		let attempts = 0;
		const timer = setInterval(() => {
			if (token !== navigationToken || ++attempts > 40) {
				clearInterval(timer);
				return;
			}
			const row = document.querySelector<HTMLElement>(META_ROW);
			if (!row || row.children.length < 2) return;
			clearInterval(timer);
			void inject(row, albumId, token);
		}, 250);
	}

	async function inject(row: HTMLElement, albumId: string, token: number): Promise<void> {
		if (row.querySelector(`[${MARKER}]`)) return;

		let label: string | undefined;
		try {
			const response = (await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.getAlbum, {
				uri: `spotify:album:${albumId}`,
				locale: "",
				offset: 0,
				limit: 1,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			})) as any;
			label = response?.data?.albumUnion?.label;
		} catch (error) {
			console.error("[label-link] could not resolve label", error);
			return;
		}

		// The user may have navigated on while that request was in flight.
		if (!label || token !== navigationToken || !row.isConnected) return;
		if (row.querySelector(`[${MARKER}]`)) return;

		const children = [...row.children] as HTMLElement[];

		// Positional anchor — see findHeaderAnchor for why this must not depend
		// on artist links.
		const anchor = findHeaderAnchor(children.map((node) => node.textContent || ""));
		if (!anchor) return;
		const lastCredit = children[anchor.creditIndex];
		const separator = children[anchor.separatorIndex];
		const valueNode = children[anchor.valueIndex]; // the year

		// Cloning live nodes inherits Spotify's typography classes, which are
		// generated per build and would rot if hardcoded. The label is cloned from
		// the year — a value node — and never from a separator: Spotify collapses
		// runs of separators via `.sep:has(+ .sep) { display: none }`, which
		// silently hid both injected nodes when they shared that class.
		const ownSeparator = separator.cloneNode(true) as HTMLElement;
		ownSeparator.setAttribute(MARKER, albumId);

		const holder = valueNode.cloneNode(false) as HTMLElement;
		holder.setAttribute(MARKER, albumId);
		holder.classList.add("label-link");

		const link = document.createElement("a");
		link.textContent = label;
		link.href = catalogueHref(label);
		link.addEventListener("click", (event) => {
			event.preventDefault();
			Spicetify.Platform.History.push(catalogueHref(label as string));
		});
		holder.appendChild(link);

		lastCredit.after(ownSeparator);
		ownSeparator.after(holder);
	}
}
