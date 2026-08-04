import {
	fetchAlbumDetail,
	fetchArtistReleaseUris,
	labelQuery,
	normalizeLabel,
	searchAlbumsPage,
	type AlbumDetail,
} from "./pathfinder";

/**
 * Builds a label catalogue in three passes:
 *
 *  1. search    — collect candidates, but only as far as the backend's own
 *                 `totalCount`. Paging past it returns loosely-related albums
 *                 rather than nothing, which is what contaminated M-Plant.
 *  2. verify    — fetch each candidate's real `label` and keep exact matches.
 *                 The same request carries the tracks the list view renders,
 *                 so verification costs nothing extra.
 *  3. expand    — the search ceiling is a hard 100, so walk the discography of
 *                 every artist found on the label to reach the rest.
 */

export type Phase = "searching" | "verifying" | "expanding" | "done";

export interface CatalogueState {
	albums: AlbumDetail[];
	phase: Phase;
	candidatesChecked: number;
	candidatesTotal: number;
	rejected: number;
	artistsExpanded: number;
	artistsTotal: number;
}

export interface Cancellation {
	cancelled: boolean;
}

/** Concurrency high enough to be quick, low enough not to hammer the backend. */
const POOL = 5;

/** Guard against a label whose roster explodes into thousands of requests. */
const MAX_ARTISTS = 40;

async function pooled<T>(items: T[], worker: (item: T) => Promise<void>, cancel: Cancellation): Promise<void> {
	let cursor = 0;
	const runners = Array.from({ length: Math.min(POOL, items.length) }, async () => {
		while (!cancel.cancelled) {
			const index = cursor++;
			if (index >= items.length) return;
			await worker(items[index]);
		}
	});
	await Promise.all(runners);
}

export async function buildCatalogue(
	label: string,
	onProgress: (state: CatalogueState) => void,
	cancel: Cancellation
): Promise<CatalogueState> {
	const wanted = normalizeLabel(label);
	const verified = new Map<string, AlbumDetail>();
	const seen = new Set<string>();

	const state: CatalogueState = {
		albums: [],
		phase: "searching",
		candidatesChecked: 0,
		candidatesTotal: 0,
		rejected: 0,
		artistsExpanded: 0,
		artistsTotal: 0,
	};

	const emit = () => {
		state.albums = [...verified.values()].sort(byDateDesc);
		onProgress({ ...state });
	};

	// --- 1. search ------------------------------------------------------------
	const candidates: string[] = [];
	const PAGE = 50;
	let total = 0;

	for (let offset = 0; offset < 1000; offset += PAGE) {
		if (cancel.cancelled) return state;
		const page = await searchAlbumsPage(labelQuery(label), offset, PAGE);
		if (offset === 0) {
			total = page.totalCount;
			state.candidatesTotal = total;
			emit();
		}
		for (const item of page.items) {
			if (item?.uri && !seen.has(item.uri)) {
				seen.add(item.uri);
				candidates.push(item.uri);
			}
		}
		// Respect the backend's own count; past it the results stop being matches.
		if (page.items.length < PAGE || candidates.length >= total) break;
	}

	// --- 2. verify ------------------------------------------------------------
	state.phase = "verifying";
	emit();

	await pooled(
		candidates,
		async (uri) => {
			const detail = await fetchAlbumDetail(uri);
			state.candidatesChecked++;
			if (detail && normalizeLabel(detail.label) === wanted) verified.set(uri, detail);
			else state.rejected++;
			if (state.candidatesChecked % 5 === 0) emit();
		},
		cancel
	);
	emit();
	if (cancel.cancelled) return state;

	// --- 3. expand via artists -----------------------------------------------
	state.phase = "expanding";
	const artistUris = [...new Set([...verified.values()].flatMap((a) => a.artists.map((x) => x.uri)))]
		.filter(Boolean)
		.slice(0, MAX_ARTISTS);
	state.artistsTotal = artistUris.length;
	emit();

	await pooled(
		artistUris,
		async (artistUri) => {
			const releaseUris = await fetchArtistReleaseUris(artistUri);
			const fresh = releaseUris.filter((uri) => !seen.has(uri));
			fresh.forEach((uri) => seen.add(uri));

			for (const uri of fresh) {
				if (cancel.cancelled) return;
				const detail = await fetchAlbumDetail(uri);
				if (detail && normalizeLabel(detail.label) === wanted) verified.set(uri, detail);
			}
			state.artistsExpanded++;
			emit();
		},
		cancel
	);

	state.phase = "done";
	emit();
	return state;
}

function byDateDesc(a: AlbumDetail, b: AlbumDetail): number {
	return (b.releaseDate || "").localeCompare(a.releaseDate || "");
}
