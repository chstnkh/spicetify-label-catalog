import { describe, expect, it } from "vitest";

import { albumIdFromPath, catalogueHref, extractSearchAlbumsHash, findHeaderAnchor } from "./lib";

describe("albumIdFromPath", () => {
	it("extracts the id from an album path", () => {
		expect(albumIdFromPath("/album/6MWLChMsL3lmoyBzmH5n7I")).toBe("6MWLChMsL3lmoyBzmH5n7I");
	});

	it("ignores trailing segments", () => {
		expect(albumIdFromPath("/album/abc123/extra")).toBe("abc123");
	});

	it("returns null off album pages", () => {
		expect(albumIdFromPath("/collection")).toBeNull();
		expect(albumIdFromPath("/artist/abc")).toBeNull();
		expect(albumIdFromPath("")).toBeNull();
	});
});

describe("catalogueHref", () => {
	it("routes to the catalogue with the label in the query", () => {
		expect(catalogueHref("M-Plant")).toBe("/label-catalog?label=M-Plant");
	});

	it("encodes labels that would break the query string", () => {
		expect(catalogueHref("Text Records")).toBe("/label-catalog?label=Text%20Records");
		expect(catalogueHref("Drum&Bass")).toBe("/label-catalog?label=Drum%26Bass");
	});
});

describe("findHeaderAnchor", () => {
	// Real header shapes, captured from the client. Each regressed or nearly
	// regressed at least once — see the comment on findHeaderAnchor.
	it("anchors after a single linked artist", () => {
		const row = ["Robert Hood", "•", "2026", "•", "1 song, 6 min 20 sec"];
		expect(findHeaderAnchor(row)).toEqual({ creditIndex: 0, separatorIndex: 1, valueIndex: 2 });
	});

	it("anchors after an unlinked Various Artists credit", () => {
		// Compilations credit "Various Artists" without an artist link; the
		// link-based anchor skipped these releases entirely.
		const row = ["Various Artists", "•", "2012", "•", "4 songs, 28 min 54 sec"];
		expect(findHeaderAnchor(row)).toEqual({ creditIndex: 0, separatorIndex: 1, valueIndex: 2 });
	});

	it("anchors after the whole multi-artist credit block", () => {
		// Multi-artist rows separate names with their own (non-"•") divider node;
		// the label must land after the last name, before the year.
		const row = ["Burial", "", "Four Tet", "•", "2022", "•", "2 songs, 15 min 2 sec"];
		expect(findHeaderAnchor(row)).toEqual({ creditIndex: 2, separatorIndex: 3, valueIndex: 4 });
	});

	it("tolerates whitespace around the separator", () => {
		expect(findHeaderAnchor(["Artist", " • ", "2020", "•", "x"])).toEqual({
			creditIndex: 0,
			separatorIndex: 1,
			valueIndex: 2,
		});
	});

	it("declines rows it cannot anchor in", () => {
		expect(findHeaderAnchor([])).toBeNull();
		expect(findHeaderAnchor(["Artist", "2020"])).toBeNull(); // no separator
		expect(findHeaderAnchor(["•", "2020"])).toBeNull(); // nothing before it
		expect(findHeaderAnchor(["Artist", "•"])).toBeNull(); // no value node to clone
	});
});

describe("extractSearchAlbumsHash", () => {
	const body = JSON.stringify({
		variables: { searchTerm: 'label:"M-Plant"' },
		operationName: "searchAlbums",
		extensions: { persistedQuery: { version: 1, sha256Hash: "abc123" } },
	});

	it("pulls the hash out of a searchAlbums request body", () => {
		expect(extractSearchAlbumsHash(body)).toBe("abc123");
	});

	it("ignores other operations", () => {
		expect(extractSearchAlbumsHash(JSON.stringify({ operationName: "getAlbum" }))).toBeNull();
	});

	it("never throws on hostile input — it wraps every fetch in the client", () => {
		expect(extractSearchAlbumsHash('"searchAlbums" but not json')).toBeNull();
		expect(extractSearchAlbumsHash(undefined)).toBeNull();
		expect(extractSearchAlbumsHash(new Blob(['"searchAlbums"']))).toBeNull();
		expect(extractSearchAlbumsHash(JSON.stringify({ operationName: "searchAlbums" }))).toBeNull();
	});
});
