import type { AlbumDetail } from "../api/pathfinder";

export type Filter = "all" | "album" | "single" | "compilation";
export type Sort = "date-desc" | "date-asc" | "name";

export const FILTERS: Array<{ key: Filter; label: string }> = [
	{ key: "all", label: "All" },
	{ key: "album", label: "Albums" },
	{ key: "single", label: "Singles and EPs" },
	{ key: "compilation", label: "Compilations" },
];

export function matchesFilter(album: Pick<AlbumDetail, "type">, filter: Filter): boolean {
	if (filter === "all") return true;
	const type = (album.type || "").toUpperCase();
	// Spotify files EPs under SINGLE, and the discography UI groups them the same way.
	if (filter === "single") return type === "SINGLE" || type === "EP";
	return type === filter.toUpperCase();
}

export function sortAlbums<T extends Pick<AlbumDetail, "name" | "releaseDate">>(albums: T[], sort: Sort): T[] {
	const copy = [...albums];
	if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
	const direction = sort === "date-asc" ? 1 : -1;
	return copy.sort((a, b) => (a.releaseDate || "").localeCompare(b.releaseDate || "") * direction);
}
