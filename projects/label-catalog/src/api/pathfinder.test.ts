import { describe, expect, it } from "vitest";

import { labelQuery, normalizeLabel } from "./pathfinder";

describe("normalizeLabel", () => {
	it("treats punctuation and case as noise", () => {
		expect(normalizeLabel("M-Plant")).toBe(normalizeLabel("M Plant"));
		expect(normalizeLabel("M-Plant")).toBe(normalizeLabel("mplant"));
	});

	it("keeps genuinely different labels apart", () => {
		// The distinction that stops M-Plant swallowing its neighbours.
		expect(normalizeLabel("M-Plant")).not.toBe(normalizeLabel("M-Plant Music"));
		expect(normalizeLabel("Kompakt")).not.toBe(normalizeLabel("Kompakt Extra"));
		expect(normalizeLabel("M-Plant")).not.toBe(normalizeLabel("Matthew Plante"));
	});

	it("survives empty input", () => {
		expect(normalizeLabel("")).toBe("");
	});
});

describe("labelQuery", () => {
	it("quotes the label so multi-word names stay one term", () => {
		expect(labelQuery("Text Records")).toBe('label:"Text Records"');
	});

	it("strips embedded quotes that would break out of the term", () => {
		expect(labelQuery('Ha" OR x')).toBe('label:"Ha OR x"');
	});
});
