import React from "react";

import ReleaseRow from "./components/release_row";
import { buildCatalogue, type CatalogueState } from "./api/catalogue";
import type { AlbumDetail } from "./api/pathfinder";
import { runtimeComponents } from "./types/runtime";
import { FILTERS, matchesFilter, sortAlbums, type Filter, type Sort } from "./lib/filters";

import "./styles/app.scss";


/** Height of Spotify's top bar; the sticky header parks directly beneath it. */
const TOP_BAR = 64;

/** The label travels in the query string; the custom app itself owns one route. */
function labelFromLocation(): string {
	const search = Spicetify.Platform.History.location?.search ?? "";
	const value = new URLSearchParams(search).get("label");
	return value ? decodeURIComponent(value) : "";
}

function progressText(state: CatalogueState | null): string {
	if (!state) return "";
	switch (state.phase) {
		case "searching":
			return "Searching…";
		case "verifying":
			return `Checking ${state.candidatesChecked}/${state.candidatesTotal} candidates…`;
		case "expanding":
			return `Following artist discographies ${state.artistsExpanded}/${state.artistsTotal}…`;
		default:
			return "";
	}
}

/**
 * Reports which release is currently scrolled under the sticky header, so it can
 * be echoed there with a play control — the artist discography does the same.
 */
function useActiveRelease(listRef: React.RefObject<HTMLDivElement>, deps: unknown[]): AlbumDetail["uri"] | null {
	const [activeUri, setActiveUri] = React.useState<string | null>(null);

	React.useEffect(() => {
		const list = listRef.current;
		if (!list) return;

		let frame = 0;
		const measure = () => {
			frame = 0;
			const line = TOP_BAR + 56; // just below the sticky controls
			let current: string | null = null;
			for (const section of list.querySelectorAll<HTMLElement>("[data-release-uri]")) {
				if (section.getBoundingClientRect().top <= line) current = section.dataset.releaseUri ?? null;
				else break;
			}
			setActiveUri(current);
		};

		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};

		// Capture phase on the document: scroll events do not bubble, and guessing
		// which ancestor Spotify actually scrolls proved unreliable.
		document.addEventListener("scroll", onScroll, true);
		measure();
		return () => {
			document.removeEventListener("scroll", onScroll, true);
			if (frame) cancelAnimationFrame(frame);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return activeUri;
}

const App = (): React.ReactElement => {
	const [label, setLabel] = React.useState(labelFromLocation);
	const [state, setState] = React.useState<CatalogueState | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [filter, setFilter] = React.useState<Filter>("all");
	const [sort, setSort] = React.useState<Sort>("date-desc");
	const listRef = React.useRef<HTMLDivElement>(null);

	// The app stays mounted across navigations, so react to the query string changing.
	React.useEffect(() => Spicetify.Platform.History.listen(() => setLabel(labelFromLocation())), []);

	React.useEffect(() => {
		if (!label) {
			setState(null);
			return;
		}
		const cancel = { cancelled: false };
		setState(null);
		setError(null);

		buildCatalogue(label, (next) => {
			if (!cancel.cancelled) setState(next);
		}, cancel).catch((e: Error) => {
			if (!cancel.cancelled) setError(e.message);
		});

		return () => {
			cancel.cancelled = true;
		};
	}, [label]);

	const albums = state?.albums ?? [];
	const visible = React.useMemo(
		() => sortAlbums(albums.filter((a) => matchesFilter(a, filter)), sort),
		[albums, filter, sort]
	);

	const activeUri = useActiveRelease(listRef, [visible.length, label]);
	const active = React.useMemo(() => visible.find((a) => a.uri === activeUri) ?? null, [visible, activeUri]);

	const { Chip } = runtimeComponents();

	if (!label) {
		return (
			<div className="label-catalog label-catalog--empty">
				<h1>Label catalogue</h1>
				<p>Open this page from the label link on any release.</p>
			</div>
		);
	}

	const busy = state !== null && state.phase !== "done";

	return (
		<div className="label-catalog">
			<header className="label-catalog__header">
				<div className="label-catalog__eyebrow">Label</div>
				<h1 className="label-catalog__title">{label}</h1>
				<div className="label-catalog__count">
					{albums.length} release{albums.length === 1 ? "" : "s"}
					{busy && <span className="label-catalog__progress"> · {progressText(state)}</span>}
				</div>
			</header>

			<div className="label-catalog__sticky">
				{active && (
					<div className="label-catalog__nowbar">
						<button
							className="label-catalog__nowbar-play"
							onClick={() => Spicetify.Player.playUri(active.uri)}
							aria-label={`Play ${active.name}`}
						>
							<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
								<path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" />
							</svg>
						</button>
						<span className="label-catalog__nowbar-title">{active.name}</span>
					</div>
				)}

				<div className="label-catalog__controls">
					<span className="label-catalog__sticky-name">{label}</span>
					<div className="label-catalog__chips">
						{FILTERS.map(({ key, label: text }) => (
							<Chip key={key} selected={filter === key} selectedColorSet="invertedLight" onClick={() => setFilter(key)}>
								{text}
							</Chip>
						))}
					</div>
					<select
						className="label-catalog__sort"
						value={sort}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as Sort)}
					>
						<option value="date-desc">Release date — newest</option>
						<option value="date-asc">Release date — oldest</option>
						<option value="name">Alphabetical</option>
					</select>
				</div>
			</div>

			{state && state.rejected > 0 && (
				<div className="label-catalog__notice">
					{state.rejected} search {state.rejected === 1 ? "result" : "results"} belonged to a different label and{" "}
					{state.rejected === 1 ? "was" : "were"} dropped.
				</div>
			)}

			{error && <div className="label-catalog__error">Could not load the catalogue: {error}</div>}

			<div className="label-catalog__list" ref={listRef}>
				{visible.map((album) => (
					<ReleaseRow key={album.uri} album={album} />
				))}
			</div>

			{state?.phase === "done" && visible.length === 0 && (
				<div className="label-catalog__notice">Nothing on this label matches that filter.</div>
			)}
		</div>
	);
};

export default App;
