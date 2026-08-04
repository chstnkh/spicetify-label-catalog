import { describe, expect, it } from "vitest";

import { formatDuration, prettyType, songCount, uriToRoute } from "./format";

describe("formatDuration", () => {
	it("truncates instead of rounding", () => {
		// The regression this guards: 380898ms is 6:20 in Spotify's own header,
		// and rounding rendered 6:21 right next to it.
		expect(formatDuration(380898)).toBe("6:20");
	});

	it("pads seconds", () => {
		expect(formatDuration(65_000)).toBe("1:05");
	});

	it("handles sub-minute and hour-long tracks", () => {
		expect(formatDuration(9_400)).toBe("0:09");
		expect(formatDuration(3_723_000)).toBe("62:03");
	});

	it("renders nothing for a missing duration", () => {
		expect(formatDuration(0)).toBe("");
	});
});

describe("prettyType", () => {
	it("maps Spotify's uppercase types", () => {
		expect(prettyType("SINGLE")).toBe("Single");
		expect(prettyType("ALBUM")).toBe("Album");
		expect(prettyType("COMPILATION")).toBe("Compilation");
		expect(prettyType("EP")).toBe("EP");
	});

	it("is blank for unknown or missing types rather than echoing them", () => {
		expect(prettyType("AUDIOBOOK")).toBe("");
		expect(prettyType(undefined)).toBe("");
	});
});

describe("songCount", () => {
	it("singularises one song", () => {
		expect(songCount(1)).toBe("1 song");
		expect(songCount(0)).toBe("0 songs");
		expect(songCount(4)).toBe("4 songs");
	});
});

describe("uriToRoute", () => {
	it("converts album and artist URIs", () => {
		expect(uriToRoute("spotify:album:6MWLChMsL3lmoyBzmH5n7I")).toBe("/album/6MWLChMsL3lmoyBzmH5n7I");
		expect(uriToRoute("spotify:artist:5ipQlfnpRCtyOuhYqvPvQ8")).toBe("/artist/5ipQlfnpRCtyOuhYqvPvQ8");
	});

	it("leaves anything else untouched", () => {
		expect(uriToRoute("spotify:playlist:abc")).toBe("spotify:playlist:abc");
	});
});
