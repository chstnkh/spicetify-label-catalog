import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AlbumDetail, SearchAlbumItem } from "./pathfinder";

const searchAlbumsPage = vi.fn();
const fetchAlbumDetail = vi.fn();
const fetchArtistReleaseUris = vi.fn();

vi.mock("./pathfinder", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./pathfinder")>();
	return {
		...actual,
		searchAlbumsPage: (...args: unknown[]) => searchAlbumsPage(...args),
		fetchAlbumDetail: (...args: unknown[]) => fetchAlbumDetail(...args),
		fetchArtistReleaseUris: (...args: unknown[]) => fetchArtistReleaseUris(...args),
	};
});

const { buildCatalogue } = await import("./catalogue");

function album(uri: string, label: string, artistUri = "spotify:artist:hood"): AlbumDetail {
	return {
		uri,
		name: uri,
		label,
		type: "SINGLE",
		releaseDate: "2020-01-01T00:00:00Z",
		year: 2020,
		coverUrl: "",
		artists: [{ uri: artistUri, name: "Robert Hood" }],
		saved: false,
		tracks: [],
	};
}

const hit = (uri: string): SearchAlbumItem => ({ uri, name: uri });

/** One page of search results, then nothing. */
function searchReturns(uris: string[], totalCount = uris.length) {
	searchAlbumsPage.mockImplementation(async (_term: string, offset: number) =>
		offset === 0 ? { totalCount, items: uris.map(hit) } : { totalCount, items: [] }
	);
}

beforeEach(() => {
	searchAlbumsPage.mockReset();
	fetchAlbumDetail.mockReset();
	fetchArtistReleaseUris.mockReset();
	fetchArtistReleaseUris.mockResolvedValue([]);
});

describe("buildCatalogue", () => {
	it("keeps only albums whose real label matches, and counts the rest as rejected", async () => {
		// Exactly the M-Plant failure: the search hands back neighbours once the
		// genuine matches run out, and they must not reach the catalogue.
		searchReturns(["a", "b", "c"]);
		fetchAlbumDetail.mockImplementation(async (uri: string) =>
			uri === "c" ? album(uri, "Matthew Plante") : album(uri, "M-Plant")
		);

		const result = await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		expect(result.albums.map((a) => a.uri).sort()).toEqual(["a", "b"]);
		expect(result.rejected).toBe(1);
		expect(result.phase).toBe("done");
	});

	it("matches labels that differ only by punctuation or case", async () => {
		searchReturns(["a"]);
		fetchAlbumDetail.mockResolvedValue(album("a", "m plant"));

		const result = await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		expect(result.albums).toHaveLength(1);
		expect(result.rejected).toBe(0);
	});

	it("stops paging at the backend's reported total instead of walking into noise", async () => {
		const page = Array.from({ length: 50 }, (_, i) => `a${i}`);
		searchAlbumsPage.mockImplementation(async (_term: string, offset: number) => ({
			totalCount: 50,
			items: offset === 0 ? page.map(hit) : Array.from({ length: 50 }, (_, i) => hit(`junk${offset}-${i}`)),
		}));
		fetchAlbumDetail.mockImplementation(async (uri: string) => album(uri, "M-Plant"));

		const result = await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		expect(searchAlbumsPage).toHaveBeenCalledTimes(1);
		expect(result.albums).toHaveLength(50);
	});

	it("reaches releases the search never returned by walking artist discographies", async () => {
		// The search ceiling is 100; this is how the rest of a big label is found.
		searchReturns(["a"]);
		fetchArtistReleaseUris.mockResolvedValue(["a", "b", "c"]);
		fetchAlbumDetail.mockImplementation(async (uri: string) =>
			uri === "c" ? album(uri, "Some Other Label") : album(uri, "M-Plant")
		);

		const result = await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		expect(fetchArtistReleaseUris).toHaveBeenCalledWith("spotify:artist:hood");
		expect(result.albums.map((a) => a.uri).sort()).toEqual(["a", "b"]);
	});

	it("never fetches the same release twice across the two passes", async () => {
		searchReturns(["a"]);
		fetchArtistReleaseUris.mockResolvedValue(["a", "b"]);
		fetchAlbumDetail.mockImplementation(async (uri: string) => album(uri, "M-Plant"));

		await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		const fetched = fetchAlbumDetail.mock.calls.map((c) => c[0]);
		expect(fetched).toHaveLength(new Set(fetched).size);
	});

	it("reports progress as it goes rather than only at the end", async () => {
		searchReturns(["a", "b"]);
		fetchAlbumDetail.mockImplementation(async (uri: string) => album(uri, "M-Plant"));

		const phases: string[] = [];
		await buildCatalogue("M-Plant", (state) => phases.push(state.phase), { cancelled: false });

		expect(phases).toContain("searching");
		expect(phases).toContain("verifying");
		expect(phases).toContain("expanding");
		expect(phases.at(-1)).toBe("done");
	});

	it("returns newest first", async () => {
		searchReturns(["old", "new"]);
		fetchAlbumDetail.mockImplementation(async (uri: string) => ({
			...album(uri, "M-Plant"),
			releaseDate: uri === "new" ? "2026-01-01T00:00:00Z" : "2001-01-01T00:00:00Z",
		}));

		const result = await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		expect(result.albums.map((a) => a.uri)).toEqual(["new", "old"]);
	});

	it("drops releases whose details cannot be loaded", async () => {
		searchReturns(["a", "b"]);
		fetchAlbumDetail.mockImplementation(async (uri: string) => (uri === "b" ? null : album(uri, "M-Plant")));

		const result = await buildCatalogue("M-Plant", () => {}, { cancelled: false });

		expect(result.albums.map((a) => a.uri)).toEqual(["a"]);
		expect(result.rejected).toBe(1);
	});

	it("stops early when cancelled, so leaving the page does not keep fetching", async () => {
		searchReturns(["a", "b", "c"]);
		const cancel = { cancelled: false };
		fetchAlbumDetail.mockImplementation(async (uri: string) => {
			cancel.cancelled = true;
			return album(uri, "M-Plant");
		});

		const result = await buildCatalogue("M-Plant", () => {}, cancel);

		expect(fetchAlbumDetail.mock.calls.length).toBeLessThan(3);
		expect(result.phase).not.toBe("done");
		expect(fetchArtistReleaseUris).not.toHaveBeenCalled();
	});
});
