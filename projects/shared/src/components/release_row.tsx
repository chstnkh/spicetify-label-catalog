import React from "react";

import type { AlbumDetail, Credit } from "../api/pathfinder";
import { runtimeComponents } from "../types/runtime";
import { formatDuration, prettyType, songCount, uriToRoute } from "../lib/format";

/**
 * One release per row with its full tracklist — the same shape as the artist
 * page's expanded "Release date" discography view, including the Plays column,
 * the hover play control and the credit links.
 */
const ReleaseRow = ({ album }: { album: AlbumDetail }): React.ReactElement => {
	const { ContextMenu, AlbumMenu, TrackMenu } = runtimeComponents();
	const [saved, setSaved] = React.useState(album.saved);

	const play = (uri: string) => (event: React.MouseEvent) => {
		event.stopPropagation();
		Spicetify.Player.playUri(uri);
	};

	const openAlbum = () => Spicetify.Platform.History.push(uriToRoute(album.uri));

	const toggleSaved = (event: React.MouseEvent) => {
		event.stopPropagation();
		const library = (Spicetify.Platform as unknown as Record<string, never>)["LibraryAPI"] as
			| { add: (a: { uris: string[] }) => void; remove: (a: { uris: string[] }) => void }
			| undefined;
		if (!library) return;
		if (saved) library.remove({ uris: [album.uri] });
		else library.add({ uris: [album.uri] });
		setSaved(!saved);
	};

	const meta = [prettyType(album.type), album.year, songCount(album.tracks.length)].filter(Boolean).join(" • ");

	return (
		<section className="release-row" data-release-uri={album.uri} data-release-name={album.name}>
			<div className="release-row__head">
				<ContextMenu menu={<AlbumMenu uri={album.uri} canRemove={false} />} trigger="right-click">
					<img className="release-row__cover" src={album.coverUrl} alt="" loading="lazy" onClick={openAlbum} />
				</ContextMenu>

				<div className="release-row__info">
					<h2 className="release-row__title" onClick={openAlbum}>
						{album.name}
					</h2>
					<div className="release-row__meta">{meta}</div>

					<div className="release-row__actions">
						<button className="release-row__play" onClick={play(album.uri)} aria-label={`Play ${album.name}`}>
							<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
								<path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" />
							</svg>
						</button>

						<button
							className={`release-row__action${saved ? " release-row__action--on" : ""}`}
							onClick={toggleSaved}
							aria-label={saved ? `Remove ${album.name} from library` : `Save ${album.name} to library`}
						>
							{saved ? (
								<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
									<path d="M12 1a11 11 0 100 22 11 11 0 000-22zm5.045 8.03l-6.5 6.5a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l2.47 2.47 5.97-5.97a.75.75 0 111.06 1.06z" />
								</svg>
							) : (
								<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
									<circle cx="12" cy="12" r="10.25" />
									<path d="M12 7.25v9.5M7.25 12h9.5" strokeLinecap="round" />
								</svg>
							)}
						</button>

						<ContextMenu menu={<AlbumMenu uri={album.uri} canRemove={false} />} trigger="click" action="toggle">
							<button className="release-row__action" aria-label={`More options for ${album.name}`}>
								<svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
									<path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
								</svg>
							</button>
						</ContextMenu>
					</div>
				</div>
			</div>

			<table className="release-row__tracks">
				<thead>
					<tr>
						<th className="release-row__col-num">#</th>
						<th className="release-row__col-title">Title</th>
						<th className="release-row__col-plays">Plays</th>
						<th className="release-row__col-time">
							<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
								<path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" />
								<path d="M8 3.25a.75.75 0 01.75.75v3.25H11a.75.75 0 010 1.5H7.25V4A.75.75 0 018 3.25z" />
							</svg>
						</th>
						<th className="release-row__col-menu" />
					</tr>
				</thead>
				<tbody>
					{album.tracks.map((track) => (
						<tr key={track.uri} onDoubleClick={play(track.uri)}>
							{/* Hovering swaps the track number for a play control, the way the
							    artist discography behaves. */}
							<td className="release-row__col-num">
								<span className="release-row__num">{track.trackNumber || "–"}</span>
								<button
									className="release-row__track-play"
									onClick={play(track.uri)}
									aria-label={`Play ${track.name}`}
								>
									<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
										<path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z" />
									</svg>
								</button>
							</td>
							<td className="release-row__col-title">
								<div className="release-row__track-name">{track.name}</div>
								<div className="release-row__track-artist">
									<Credits credits={track.artists} />
								</div>
							</td>
							<td className="release-row__col-plays">
								{track.playcount != null ? track.playcount.toLocaleString("en-US") : ""}
							</td>
							<td className="release-row__col-time">{formatDuration(track.durationMs)}</td>
							<td className="release-row__col-menu">
								<ContextMenu menu={<TrackMenu uri={track.uri} />} trigger="click" action="toggle">
									<button className="release-row__track-menu" aria-label={`More options for ${track.name}`}>
										<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
											<path d="M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
										</svg>
									</button>
								</ContextMenu>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
};

/** Comma-separated artist links, each navigating to the artist page. */
const Credits = ({ credits }: { credits: Credit[] }): React.ReactElement => (
	<>
		{(credits || []).filter((credit) => credit?.uri && credit?.name).map((credit, index) => (
			<React.Fragment key={credit.uri}>
				{index > 0 && ", "}
				<a
					className="release-row__credit"
					href={uriToRoute(credit.uri)}
					title={credit.name}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						Spicetify.Platform.History.push(uriToRoute(credit.uri));
					}}
				>
					{credit.name}
				</a>
			</React.Fragment>
		))}
	</>
);

export default ReleaseRow;
