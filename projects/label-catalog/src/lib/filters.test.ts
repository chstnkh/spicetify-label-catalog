import { describe, expect, it } from "vitest";

import { matchesFilter, sortAlbums } from "./filters";

const album = (type: string) => ({ type });

describe("matchesFilter", () => {
	it("passes everything under All", () => {
		expect(matchesFilter(album("ALBUM"), "all")).toBe(true);
		expect(matchesFilter(album(""), "all")).toBe(true);
	});

	it("groups EPs with singles, the way the discography does", () => {
		expect(matchesFilter(album("SINGLE"), "single")).toBe(true);
		expect(matchesFilter(album("EP"), "single")).toBe(true);
		expect(matchesFilter(album("ALBUM"), "single")).toBe(false);
	});

	it("keeps albums and compilations apart", () => {
		expect(matchesFilter(album("ALBUM"), "album")).toBe(true);
		expect(matchesFilter(album("COMPILATION"), "album")).toBe(false);
		expect(matchesFilter(album("COMPILATION"), "compilation")).toBe(true);
	});

	it("does not throw on a missing type", () => {
		expect(matchesFilter({ type: "" }, "album")).toBe(false);
	});
});

describe("sortAlbums", () => {
	const items = [
		{ name: "Beta", releaseDate: "2014-01-01T00:00:00Z" },
		{ name: "Alpha", releaseDate: "2026-07-31T00:00:00Z" },
		{ name: "Gamma", releaseDate: "2020-05-05T00:00:00Z" },
	];

	it("orders newest first by default", () => {
		expect(sortAlbums(items, "date-desc").map((a) => a.name)).toEqual(["Alpha", "Gamma", "Beta"]);
	});

	it("reverses for oldest first", () => {
		expect(sortAlbums(items, "date-asc").map((a) => a.name)).toEqual(["Beta", "Gamma", "Alpha"]);
	});

	it("sorts alphabetically", () => {
		expect(sortAlbums(items, "name").map((a) => a.name)).toEqual(["Alpha", "Beta", "Gamma"]);
	});

	it("does not mutate the input", () => {
		const original = [...items];
		sortAlbums(items, "name");
		expect(items).toEqual(original);
	});

	it("puts releases with no date last when sorting newest first", () => {
		const withMissing = [...items, { name: "Undated", releaseDate: null }];
		expect(sortAlbums(withMissing, "date-desc").at(-1)?.name).toBe("Undated");
	});
});
