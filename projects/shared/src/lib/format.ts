/** Presentation helpers, kept free of Spotify globals so they can be tested. */

export function songCount(n: number): string {
	return `${n} song${n === 1 ? "" : "s"}`;
}

/**
 * Truncates rather than rounds: Spotify's own header floors, and rounding
 * displayed 6:21 next to the native 6:20 for the same track.
 */
export function formatDuration(ms: number): string {
	if (!ms) return "";
	const total = Math.floor(ms / 1000);
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function prettyType(type?: string): string {
	switch ((type || "").toUpperCase()) {
		case "SINGLE":
			return "Single";
		case "COMPILATION":
			return "Compilation";
		case "EP":
			return "EP";
		case "ALBUM":
			return "Album";
		default:
			return "";
	}
}

/** Turns a Spotify URI into the client's in-app route. */
export function uriToRoute(uri: string): string {
	return uri.replace(/^spotify:(album|artist|track):/, (_, kind: string) => `/${kind}/`);
}
