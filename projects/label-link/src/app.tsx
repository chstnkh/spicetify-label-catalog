import React from "react";

import CataloguePage, { labelFromLocation } from "../../shared/src/components/catalogue_page";
import { ROUTE, injectStyles, startLabelLink } from "./label_link";

/**
 * Extension entry point.
 *
 * Spicetify has no runtime API for registering a route — custom-app routes are
 * written into `xpui` by the CLI. But an unknown path renders an *empty* main
 * view rather than an error page, and the client's router does not reclaim that
 * container. So the extension mounts the catalogue there itself, which keeps the
 * real URL, the back/forward buttons and the scroll container.
 *
 * When the companion custom app is installed it owns the route properly; the
 * takeover then sees a non-empty container and stands down.
 */

const CONTAINER_SELECTORS = [".main-view-container__scroll-node-child", ".main-view-container"];

function findContainer(): HTMLElement | null {
	for (const selector of CONTAINER_SELECTORS) {
		const node = document.querySelector<HTMLElement>(selector);
		if (node) return node;
	}
	return null;
}

/**
 * Spicetify's extension wrapper only waits for React, but this needs the
 * platform and GraphQL surfaces too. Check for the *method*, not just the
 * namespace: after an in-place page reload `Spicetify.GraphQL` exists while
 * `Request` is still unbound, and starting then leaves every lookup throwing.
 */
function ready(): boolean {
	return Boolean(Spicetify?.Platform?.History) && typeof Spicetify?.GraphQL?.Request === "function";
}

function main(): void {
	if (!ready()) {
		setTimeout(main, 300);
		return;
	}

	injectStyles();
	startLabelLink();

	let host: HTMLElement | null = null;
	let root: { render: (node: React.ReactElement) => void; unmount: () => void } | null = null;

	const unmount = () => {
		root?.unmount();
		root = null;
		host?.remove();
		host = null;
	};

	const sync = () => {
		const onRoute = Spicetify.Platform.History.location?.pathname === ROUTE;
		if (!onRoute) {
			// Spotify leaves our node behind when navigating away, so clean up here.
			if (root) unmount();
			return;
		}

		const label = labelFromLocation();
		if (root) {
			root.render(<CataloguePage label={label} />);
			return;
		}

		// Give the client a moment to settle on the new route before judging the
		// container, then stand down if the custom app already rendered into it.
		setTimeout(() => {
			if (Spicetify.Platform.History.location?.pathname !== ROUTE) return;
			const container = findContainer();
			if (!container || container.querySelector(".label-catalog")) return;

			// Append rather than replace: tearing React-managed children out of the
			// container corrupts Spotify's reconciliation for the rest of the
			// session — later pages render into a fresh container and lose their
			// header markup. The unknown route leaves this container empty anyway.
			host = document.createElement("div");
			host.className = "label-catalog-host";
			container.append(host);

			const ReactDOM = Spicetify.ReactDOM as unknown as {
				createRoot?: (el: Element) => { render: (n: React.ReactElement) => void; unmount: () => void };
				render: (n: React.ReactElement, el: Element) => void;
				unmountComponentAtNode: (el: Element) => void;
			};

			root = ReactDOM.createRoot
				? ReactDOM.createRoot(host)
				: {
						render: (node) => ReactDOM.render(node, host as Element),
						unmount: () => ReactDOM.unmountComponentAtNode(host as Element),
					};
			root.render(<CataloguePage label={labelFromLocation()} />);
		}, 250);
	};

	Spicetify.Platform.History.listen(sync);
	sync();
}

export default main;
