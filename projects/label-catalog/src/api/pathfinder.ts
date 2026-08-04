/**
 * Access to the client's own search backend (api-partner.spotify.com/pathfinder).
 *
 * This is deliberately not the public Web API: `api.spotify.com` rate-limits hard
 * (a single offset-walk earned a 429 lasting >20 minutes) and its `label:` results
 * cap at roughly 100.
 *
 * Important: `searchAlbums` is a relevance-ranked search, NOT a filter. It reports
 * a capped `totalCount` of 100 and, once genuine matches run out, keeps serving
 * progressively looser matches instead of stopping. Paging blindly past the
 * reported total is what pulled unrelated labels into the M-Plant catalogue, so
 * every candidate has to be checked against its real `label` value.
 */

import type { SearchAlbumsResponse } from "../types/runtime";

/** Persisted-query hash for `searchAlbums`, captured from Spotify 1.2.94.583. */
const BAKED_HASH = "64ae1fe6df380b038c0a65a2606d3361bc270de6870b2fdc99cf0848b1efa6d3";

const HASH_STORAGE_KEY = "label-catalog:searchAlbums-hash";
// Versioned: cached entries are the exact `AlbumDetail` shape, so any change to
// that interface must invalidate them. Track credits went from plain strings to
// {uri, name}, and stale entries crashed the credit links on read.
const CACHE_KEY = "label-catalog:album-cache:v2";

/**
 * Persisted-query hashes are build-specific, so a Spotify update will eventually
 * invalidate the baked-in one. The extension records the hash whenever the client
 * runs its own album search, which lets us recover without a release.
 */
export function currentHash(): string {
	try {
		return localStorage.getItem(HASH_STORAGE_KEY) || BAKED_HASH;
	} catch {
		return BAKED_HASH;
	}
}

export interface Credit {
	uri: string;
	name: string;
}

export interface Track {
	uri: string;
	name: string;
	trackNumber: number;
	durationMs: number;
	playcount: number | null;
	artists: Credit[];
}

export interface AlbumDetail {
	uri: string;
	name: string;
	label: string;
	type: string;
	releaseDate: string | null;
	year: number | null;
	coverUrl: string;
	artists: Credit[];
	saved: boolean;
	tracks: Track[];
}

export interface SearchAlbumItem {
	uri: string;
	name: string;
	type?: string;
	artists?: { items?: Array<{ uri: string; profile?: { name?: string } }> };
}

/**
 * Labels are free text, so compare on a squashed form: this treats "M-Plant",
 * "M Plant" and "MPlant" as one label while keeping "M-Plant Music" separate.
 */
export function normalizeLabel(label: string): string {
	return (label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Quoting matters: an unquoted multi-word label silently becomes a free-text search. */
export function labelQuery(label: string): string {
	return `label:"${label.replace(/"/g, "")}"`;
}

// --- transport ---------------------------------------------------------------

/**
 * The pathfinder responses are persisted-query payloads with no published schema,
 * so they are parsed defensively rather than typed structurally.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawNode = Record<string, any>;

function persistedQuery(name: string, hash: string) {
	return { name, operation: "query", sha256Hash: hash, value: null };
}

async function request(definition: unknown, variables: Record<string, unknown>): Promise<unknown> {
	return Spicetify.GraphQL.Request(definition as never, variables);
}

// --- album detail (also the label check) -------------------------------------

const memoryCache = new Map<string, AlbumDetail | null>();

function readDiskCache(): Record<string, AlbumDetail> {
	try {
		return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
	} catch {
		return {};
	}
}

let diskCache: Record<string, AlbumDetail> | null = null;
let flushTimer: number | undefined;

function cacheGet(uri: string): AlbumDetail | undefined {
	if (memoryCache.has(uri)) return memoryCache.get(uri) ?? undefined;
	if (!diskCache) diskCache = readDiskCache();
	return diskCache[uri];
}

function cacheSet(uri: string, detail: AlbumDetail | null): void {
	memoryCache.set(uri, detail);
	if (!detail) return;
	if (!diskCache) diskCache = readDiskCache();
	diskCache[uri] = detail;
	// Batch writes: enrichment runs hundreds of albums and localStorage is sync.
	clearTimeout(flushTimer);
	flushTimer = window.setTimeout(() => {
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify(diskCache));
		} catch {
			// Quota exceeded — drop the cache rather than break the page.
			try {
				localStorage.removeItem(CACHE_KEY);
			} catch {
				/* nothing else to do */
			}
			diskCache = {};
		}
	}, 1500);
}

/** Fetches full album metadata: the label to verify against, and the tracks to render. */
export async function fetchAlbumDetail(uri: string): Promise<AlbumDetail | null> {
	const cached = cacheGet(uri);
	if (cached !== undefined) return cached;

	try {
		const response = (await request(Spicetify.GraphQL.Definitions.getAlbum, {
			uri,
			locale: "",
			offset: 0,
			limit: 50,
		})) as RawNode;

		const album: RawNode | undefined = response?.data?.albumUnion;
		if (!album?.name) {
			cacheSet(uri, null);
			return null;
		}

		const sources: Array<{ url: string; width: number }> = album.coverArt?.sources || [];
		const detail: AlbumDetail = {
			uri,
			name: album.name,
			label: album.label || "",
			type: album.type || "",
			releaseDate: album.date?.isoString ?? null,
			year: album.date?.isoString ? new Date(album.date.isoString).getUTCFullYear() : null,
			coverUrl: [...sources].sort((a, b) => b.width - a.width)[0]?.url ?? "",
			artists: (album.artists?.items || []).map((a: RawNode) => ({
				uri: a?.uri,
				name: a?.profile?.name ?? "",
			})),
			saved: album.saved === true,
			tracks: (album.tracksV2?.items || [])
				.map((entry: RawNode) => entry?.track)
				.filter(Boolean)
				.map((t: RawNode) => ({
					uri: t.uri,
					name: t.name,
					trackNumber: t.trackNumber ?? 0,
					durationMs: t.duration?.totalMilliseconds ?? 0,
					playcount: t.playcount != null && t.playcount !== "" ? Number(t.playcount) : null,
					artists: (t.artists?.items || [])
						.map((a: RawNode) => ({ uri: a?.uri, name: a?.profile?.name ?? "" }))
						.filter((a: Credit) => a.uri && a.name),
				})),
		};

		cacheSet(uri, detail);
		return detail;
	} catch {
		return null;
	}
}

// --- search ------------------------------------------------------------------

export interface SearchPage {
	totalCount: number;
	items: SearchAlbumItem[];
}

export async function searchAlbumsPage(searchTerm: string, offset: number, limit = 50): Promise<SearchPage> {
	const response = (await request(persistedQuery("searchAlbums", currentHash()), {
		searchTerm,
		offset,
		limit,
		numberOfTopResults: 20,
		includePreReleases: false,
		includeAlbumPreReleases: true,
		includeAudiobooks: true,
		includeAuthors: false,
		includeEpisodeContentRatingsV2: true,
	})) as SearchAlbumsResponse;

	const albums = response?.data?.searchV2?.albumsV2;
	if (!albums) {
		throw new Error(
			"searchAlbums returned no album section — the persisted-query hash is probably stale for this Spotify build"
		);
	}
	return {
		totalCount: albums.totalCount ?? 0,
		items: (albums.items || []).map((entry) => entry?.data as SearchAlbumItem).filter(Boolean),
	};
}

// --- artist discography (the way past the 100-result ceiling) ----------------

/**
 * Walks every release an artist has, which is how the catalogue gets past the
 * search backend's hard ceiling of 100 matches per label.
 */
export async function fetchArtistReleaseUris(artistUri: string): Promise<string[]> {
	const uris: string[] = [];
	const PAGE = 50;

	for (let offset = 0; offset < 1000; offset += PAGE) {
		let response: RawNode;
		try {
			response = (await request(Spicetify.GraphQL.Definitions.queryArtistDiscographyAll, {
				uri: artistUri,
				offset,
				limit: PAGE,
				locale: "",
				order: "DATE_DESC",
			})) as RawNode;
		} catch {
			break;
		}

		const all: RawNode | undefined = response?.data?.artistUnion?.discography?.all;
		const items: RawNode[] = all?.items || [];
		if (!items.length) break;

		for (const group of items) {
			for (const release of group?.releases?.items || []) {
				const uri: string | undefined = release?.uri;
				if (uri) uris.push(uri);
			}
		}

		const total: number = all?.totalCount ?? 0;
		if (offset + PAGE >= total) break;
	}

	return uris;
}
