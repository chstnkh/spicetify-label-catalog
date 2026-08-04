/** Pure helpers for the extension, kept free of DOM and Spicetify globals so
 * they can be unit-tested. The header-anchor logic lives here because it has
 * regressed before: see `findHeaderAnchor`. */

export const ROUTE = "/label-catalog";

export function catalogueHref(label: string): string {
	return `${ROUTE}?label=${encodeURIComponent(label)}`;
}

/** Extracts the album id from an in-app path, or null off album pages. */
export function albumIdFromPath(pathname: string): string | null {
	const match = pathname.match(/^\/album\/([A-Za-z0-9]+)/);
	return match ? match[1] : null;
}

/**
 * Where in the header meta row the label belongs.
 *
 * The row reads `<credits> • <year> • <duration>`, but the credit block varies:
 * a single linked artist, several artists with Spotify's own separators between
 * them, or an *unlinked* "Various Artists" on compilations. Anchoring on artist
 * links (`a[href^="/artist/"]`) looked right until compilations silently
 * stopped getting the link — so the anchor is purely positional: the label goes
 * after the node before the first "•", cloned from the value node after it.
 */
export interface HeaderAnchor {
	/** Last node of the credit block — the label is inserted after it. */
	creditIndex: number;
	/** The first "•" — cloned for our own separator. */
	separatorIndex: number;
	/** The year — cloned so the label inherits value-node typography. */
	valueIndex: number;
}

export function findHeaderAnchor(texts: readonly string[]): HeaderAnchor | null {
	const separatorIndex = texts.findIndex((text) => text.trim() === "•");
	if (separatorIndex <= 0) return null; // absent, or nothing before it to anchor on
	if (separatorIndex + 1 >= texts.length) return null; // no value node to clone
	return { creditIndex: separatorIndex - 1, separatorIndex, valueIndex: separatorIndex + 1 };
}

/**
 * Pulls the persisted-query hash out of an intercepted `searchAlbums` request
 * body. Returns null for anything else — including bodies that are not strings
 * (FormData, Blob) and strings that are not JSON, since the fetch wrapper must
 * never throw on someone else's request.
 */
export function extractSearchAlbumsHash(body: unknown): string | null {
	if (typeof body !== "string" || !body.includes('"searchAlbums"')) return null;
	try {
		const hash = JSON.parse(body)?.extensions?.persistedQuery?.sha256Hash;
		return typeof hash === "string" && hash.length > 0 ? hash : null;
	} catch {
		return null;
	}
}
