import type React from "react";

/**
 * Spotify ships more React components at runtime than Spicetify publishes types
 * for. Verified present and working on 1.2.94.583: `Cards` (Default/FeatureCard/
 * Hero/CardImage/Artist/Playlist/Album/Show/Profile/Audiobook), `Chip`,
 * `Dropdown`, `ContextMenu`, `AlbumMenu`.
 *
 * These are the discography grid and filter chips the design reuses, so rather
 * than reimplementing them we reach through a narrow typed shim in one place.
 *
 * Deliberately absent: `TextComponent`. On 1.2.94.583 it returns a forwardRef
 * object instead of an element, so rendering it throws React error #31 with any
 * props at all. Plain markup styled from app.scss is used for text instead.
 */
type AnyComponent = React.ComponentType<Record<string, unknown>>;

interface RuntimeComponents {
	Cards: Record<"Default" | "FeatureCard" | "Hero" | "CardImage" | "Artist" | "Playlist" | "Album", AnyComponent>;
	Chip: AnyComponent;
	Dropdown: AnyComponent;
	ContextMenu: AnyComponent;
	AlbumMenu: AnyComponent;
	TrackMenu: AnyComponent;
}

export function runtimeComponents(): RuntimeComponents {
	return Spicetify.ReactComponent as unknown as RuntimeComponents;
}

/** Shape of the pathfinder `searchAlbums` response we depend on. */
export interface SearchAlbumsResponse {
	data?: {
		searchV2?: {
			albumsV2?: {
				totalCount?: number;
				items?: Array<{ data?: unknown }>;
			};
		};
	};
}

