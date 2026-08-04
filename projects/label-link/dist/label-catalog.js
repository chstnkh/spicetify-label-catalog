(async function() {
        while (!Spicetify.React || !Spicetify.ReactDOM) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        var labelDcatalog = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // external-global-plugin:react
  var require_react = __commonJS({
    "external-global-plugin:react"(exports, module) {
      module.exports = Spicetify.React;
    }
  });

  // src/app.tsx
  var import_react3 = __toESM(require_react());

  // ../shared/src/components/catalogue_page.tsx
  var import_react2 = __toESM(require_react());

  // ../shared/src/components/release_row.tsx
  var import_react = __toESM(require_react());

  // ../shared/src/types/runtime.ts
  function runtimeComponents() {
    return Spicetify.ReactComponent;
  }

  // ../shared/src/lib/format.ts
  function songCount(n) {
    return `${n} song${n === 1 ? "" : "s"}`;
  }
  function formatDuration(ms) {
    if (!ms)
      return "";
    const total = Math.floor(ms / 1e3);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  }
  function prettyType(type) {
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
  function uriToRoute(uri) {
    return uri.replace(/^spotify:(album|artist|track):/, (_, kind) => `/${kind}/`);
  }

  // ../shared/src/components/release_row.tsx
  var ReleaseRow = ({ album }) => {
    const { ContextMenu, AlbumMenu, TrackMenu } = runtimeComponents();
    const [saved, setSaved] = import_react.default.useState(album.saved);
    const play = (uri) => (event) => {
      event.stopPropagation();
      Spicetify.Player.playUri(uri);
    };
    const openAlbum = () => Spicetify.Platform.History.push(uriToRoute(album.uri));
    const toggleSaved = (event) => {
      event.stopPropagation();
      const library = Spicetify.Platform["LibraryAPI"];
      if (!library)
        return;
      if (saved)
        library.remove({ uris: [album.uri] });
      else
        library.add({ uris: [album.uri] });
      setSaved(!saved);
    };
    const meta = [prettyType(album.type), album.year, songCount(album.tracks.length)].filter(Boolean).join(" \u2022 ");
    return /* @__PURE__ */ import_react.default.createElement("section", {
      className: "release-row",
      "data-release-uri": album.uri,
      "data-release-name": album.name
    }, /* @__PURE__ */ import_react.default.createElement("div", {
      className: "release-row__head"
    }, /* @__PURE__ */ import_react.default.createElement(ContextMenu, {
      menu: /* @__PURE__ */ import_react.default.createElement(AlbumMenu, {
        uri: album.uri,
        canRemove: false
      }),
      trigger: "right-click"
    }, /* @__PURE__ */ import_react.default.createElement("img", {
      className: "release-row__cover",
      src: album.coverUrl,
      alt: "",
      loading: "lazy",
      onClick: openAlbum
    })), /* @__PURE__ */ import_react.default.createElement("div", {
      className: "release-row__info"
    }, /* @__PURE__ */ import_react.default.createElement("h2", {
      className: "release-row__title",
      onClick: openAlbum
    }, album.name), /* @__PURE__ */ import_react.default.createElement("div", {
      className: "release-row__meta"
    }, meta), /* @__PURE__ */ import_react.default.createElement("div", {
      className: "release-row__actions"
    }, /* @__PURE__ */ import_react.default.createElement("button", {
      className: "release-row__play",
      onClick: play(album.uri),
      "aria-label": `Play ${album.name}`
    }, /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "22",
      height: "22",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"
    }))), /* @__PURE__ */ import_react.default.createElement("button", {
      className: `release-row__action${saved ? " release-row__action--on" : ""}`,
      onClick: toggleSaved,
      "aria-label": saved ? `Remove ${album.name} from library` : `Save ${album.name} to library`
    }, saved ? /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "24",
      height: "24",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M12 1a11 11 0 100 22 11 11 0 000-22zm5.045 8.03l-6.5 6.5a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l2.47 2.47 5.97-5.97a.75.75 0 111.06 1.06z"
    })) : /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "24",
      height: "24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10.25"
    }), /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M12 7.25v9.5M7.25 12h9.5",
      strokeLinecap: "round"
    }))), /* @__PURE__ */ import_react.default.createElement(ContextMenu, {
      menu: /* @__PURE__ */ import_react.default.createElement(AlbumMenu, {
        uri: album.uri,
        canRemove: false
      }),
      trigger: "click",
      action: "toggle"
    }, /* @__PURE__ */ import_react.default.createElement("button", {
      className: "release-row__action",
      "aria-label": `More options for ${album.name}`
    }, /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "20",
      height: "20",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
    }))))))), /* @__PURE__ */ import_react.default.createElement("table", {
      className: "release-row__tracks"
    }, /* @__PURE__ */ import_react.default.createElement("thead", null, /* @__PURE__ */ import_react.default.createElement("tr", null, /* @__PURE__ */ import_react.default.createElement("th", {
      className: "release-row__col-num"
    }, "#"), /* @__PURE__ */ import_react.default.createElement("th", {
      className: "release-row__col-title"
    }, "Title"), /* @__PURE__ */ import_react.default.createElement("th", {
      className: "release-row__col-plays"
    }, "Plays"), /* @__PURE__ */ import_react.default.createElement("th", {
      className: "release-row__col-time"
    }, /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"
    }), /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M8 3.25a.75.75 0 01.75.75v3.25H11a.75.75 0 010 1.5H7.25V4A.75.75 0 018 3.25z"
    }))), /* @__PURE__ */ import_react.default.createElement("th", {
      className: "release-row__col-menu"
    }))), /* @__PURE__ */ import_react.default.createElement("tbody", null, album.tracks.map((track) => /* @__PURE__ */ import_react.default.createElement("tr", {
      key: track.uri,
      onDoubleClick: play(track.uri)
    }, /* @__PURE__ */ import_react.default.createElement("td", {
      className: "release-row__col-num"
    }, /* @__PURE__ */ import_react.default.createElement("span", {
      className: "release-row__num"
    }, track.trackNumber || "\u2013"), /* @__PURE__ */ import_react.default.createElement("button", {
      className: "release-row__track-play",
      onClick: play(track.uri),
      "aria-label": `Play ${track.name}`
    }, /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "14",
      height: "14",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"
    })))), /* @__PURE__ */ import_react.default.createElement("td", {
      className: "release-row__col-title"
    }, /* @__PURE__ */ import_react.default.createElement("div", {
      className: "release-row__track-name"
    }, track.name), /* @__PURE__ */ import_react.default.createElement("div", {
      className: "release-row__track-artist"
    }, /* @__PURE__ */ import_react.default.createElement(Credits, {
      credits: track.artists
    }))), /* @__PURE__ */ import_react.default.createElement("td", {
      className: "release-row__col-plays"
    }, track.playcount != null ? track.playcount.toLocaleString("en-US") : ""), /* @__PURE__ */ import_react.default.createElement("td", {
      className: "release-row__col-time"
    }, formatDuration(track.durationMs)), /* @__PURE__ */ import_react.default.createElement("td", {
      className: "release-row__col-menu"
    }, /* @__PURE__ */ import_react.default.createElement(ContextMenu, {
      menu: /* @__PURE__ */ import_react.default.createElement(TrackMenu, {
        uri: track.uri
      }),
      trigger: "click",
      action: "toggle"
    }, /* @__PURE__ */ import_react.default.createElement("button", {
      className: "release-row__track-menu",
      "aria-label": `More options for ${track.name}`
    }, /* @__PURE__ */ import_react.default.createElement("svg", {
      viewBox: "0 0 16 16",
      width: "16",
      height: "16",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react.default.createElement("path", {
      d: "M3 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
    }))))))))));
  };
  var Credits = ({ credits }) => /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, (credits || []).filter((credit) => credit?.uri && credit?.name).map((credit, index) => /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, {
    key: credit.uri
  }, index > 0 && ", ", /* @__PURE__ */ import_react.default.createElement("a", {
    className: "release-row__credit",
    href: uriToRoute(credit.uri),
    title: credit.name,
    onClick: (event) => {
      event.preventDefault();
      event.stopPropagation();
      Spicetify.Platform.History.push(uriToRoute(credit.uri));
    }
  }, credit.name))));
  var release_row_default = ReleaseRow;

  // ../shared/src/api/pathfinder.ts
  var BAKED_HASH = "64ae1fe6df380b038c0a65a2606d3361bc270de6870b2fdc99cf0848b1efa6d3";
  var HASH_STORAGE_KEY = "label-catalog:searchAlbums-hash";
  var CACHE_KEY = "label-catalog:album-cache:v2";
  function currentHash() {
    try {
      return localStorage.getItem(HASH_STORAGE_KEY) || BAKED_HASH;
    } catch {
      return BAKED_HASH;
    }
  }
  function normalizeLabel(label) {
    return (label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function labelQuery(label) {
    return `label:"${label.replace(/"/g, "")}"`;
  }
  function persistedQuery(name, hash) {
    return { name, operation: "query", sha256Hash: hash, value: null };
  }
  async function request(definition, variables) {
    return Spicetify.GraphQL.Request(definition, variables);
  }
  var memoryCache = /* @__PURE__ */ new Map();
  function readDiskCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  }
  var diskCache = null;
  var flushTimer;
  function cacheGet(uri) {
    if (memoryCache.has(uri))
      return memoryCache.get(uri) ?? void 0;
    if (!diskCache)
      diskCache = readDiskCache();
    return diskCache[uri];
  }
  function cacheSet(uri, detail) {
    memoryCache.set(uri, detail);
    if (!detail)
      return;
    if (!diskCache)
      diskCache = readDiskCache();
    diskCache[uri] = detail;
    clearTimeout(flushTimer);
    flushTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(diskCache));
      } catch {
        try {
          localStorage.removeItem(CACHE_KEY);
        } catch {
        }
        diskCache = {};
      }
    }, 1500);
  }
  async function fetchAlbumDetail(uri) {
    const cached = cacheGet(uri);
    if (cached !== void 0)
      return cached;
    try {
      const response = await request(Spicetify.GraphQL.Definitions.getAlbum, {
        uri,
        locale: "",
        offset: 0,
        limit: 50
      });
      const album = response?.data?.albumUnion;
      if (!album?.name) {
        cacheSet(uri, null);
        return null;
      }
      const sources = album.coverArt?.sources || [];
      const detail = {
        uri,
        name: album.name,
        label: album.label || "",
        type: album.type || "",
        releaseDate: album.date?.isoString ?? null,
        year: album.date?.isoString ? new Date(album.date.isoString).getUTCFullYear() : null,
        coverUrl: [...sources].sort((a, b) => b.width - a.width)[0]?.url ?? "",
        artists: (album.artists?.items || []).map((a) => ({
          uri: a?.uri,
          name: a?.profile?.name ?? ""
        })),
        saved: album.saved === true,
        tracks: (album.tracksV2?.items || []).map((entry) => entry?.track).filter(Boolean).map((t) => ({
          uri: t.uri,
          name: t.name,
          trackNumber: t.trackNumber ?? 0,
          durationMs: t.duration?.totalMilliseconds ?? 0,
          playcount: t.playcount != null && t.playcount !== "" ? Number(t.playcount) : null,
          artists: (t.artists?.items || []).map((a) => ({ uri: a?.uri, name: a?.profile?.name ?? "" })).filter((a) => a.uri && a.name)
        }))
      };
      cacheSet(uri, detail);
      return detail;
    } catch {
      return null;
    }
  }
  async function searchAlbumsPage(searchTerm, offset, limit = 50) {
    const response = await request(persistedQuery("searchAlbums", currentHash()), {
      searchTerm,
      offset,
      limit,
      numberOfTopResults: 20,
      includePreReleases: false,
      includeAlbumPreReleases: true,
      includeAudiobooks: true,
      includeAuthors: false,
      includeEpisodeContentRatingsV2: true
    });
    const albums = response?.data?.searchV2?.albumsV2;
    if (!albums) {
      throw new Error(
        "searchAlbums returned no album section \u2014 the persisted-query hash is probably stale for this Spotify build"
      );
    }
    return {
      totalCount: albums.totalCount ?? 0,
      items: (albums.items || []).map((entry) => entry?.data).filter(Boolean)
    };
  }
  async function fetchArtistReleaseUris(artistUri) {
    const uris = [];
    const PAGE = 50;
    for (let offset = 0; offset < 1e3; offset += PAGE) {
      let response;
      try {
        response = await request(Spicetify.GraphQL.Definitions.queryArtistDiscographyAll, {
          uri: artistUri,
          offset,
          limit: PAGE,
          locale: "",
          order: "DATE_DESC"
        });
      } catch {
        break;
      }
      const all = response?.data?.artistUnion?.discography?.all;
      const items = all?.items || [];
      if (!items.length)
        break;
      for (const group of items) {
        for (const release of group?.releases?.items || []) {
          const uri = release?.uri;
          if (uri)
            uris.push(uri);
        }
      }
      const total = all?.totalCount ?? 0;
      if (offset + PAGE >= total)
        break;
    }
    return uris;
  }

  // ../shared/src/api/catalogue.ts
  var POOL = 5;
  var MAX_ARTISTS = 40;
  async function pooled(items, worker, cancel) {
    let cursor = 0;
    const runners = Array.from({ length: Math.min(POOL, items.length) }, async () => {
      while (!cancel.cancelled) {
        const index = cursor++;
        if (index >= items.length)
          return;
        await worker(items[index]);
      }
    });
    await Promise.all(runners);
  }
  async function buildCatalogue(label, onProgress, cancel) {
    const wanted = normalizeLabel(label);
    const verified = /* @__PURE__ */ new Map();
    const seen = /* @__PURE__ */ new Set();
    const state = {
      albums: [],
      phase: "searching",
      candidatesChecked: 0,
      candidatesTotal: 0,
      rejected: 0,
      artistsExpanded: 0,
      artistsTotal: 0
    };
    const emit = () => {
      state.albums = [...verified.values()].sort(byDateDesc);
      onProgress({ ...state });
    };
    const candidates = [];
    const PAGE = 50;
    let total = 0;
    for (let offset = 0; offset < 1e3; offset += PAGE) {
      if (cancel.cancelled)
        return state;
      const page = await searchAlbumsPage(labelQuery(label), offset, PAGE);
      if (offset === 0) {
        total = page.totalCount;
        state.candidatesTotal = total;
        emit();
      }
      for (const item of page.items) {
        if (item?.uri && !seen.has(item.uri)) {
          seen.add(item.uri);
          candidates.push(item.uri);
        }
      }
      if (page.items.length < PAGE || candidates.length >= total)
        break;
    }
    state.phase = "verifying";
    emit();
    await pooled(
      candidates,
      async (uri) => {
        const detail = await fetchAlbumDetail(uri);
        state.candidatesChecked++;
        if (detail && normalizeLabel(detail.label) === wanted)
          verified.set(uri, detail);
        else
          state.rejected++;
        if (state.candidatesChecked % 5 === 0)
          emit();
      },
      cancel
    );
    emit();
    if (cancel.cancelled)
      return state;
    state.phase = "expanding";
    const artistUris = [...new Set([...verified.values()].flatMap((a) => a.artists.map((x) => x.uri)))].filter(Boolean).slice(0, MAX_ARTISTS);
    state.artistsTotal = artistUris.length;
    emit();
    await pooled(
      artistUris,
      async (artistUri) => {
        const releaseUris = await fetchArtistReleaseUris(artistUri);
        const fresh = releaseUris.filter((uri) => !seen.has(uri));
        fresh.forEach((uri) => seen.add(uri));
        for (const uri of fresh) {
          if (cancel.cancelled)
            return;
          const detail = await fetchAlbumDetail(uri);
          if (detail && normalizeLabel(detail.label) === wanted)
            verified.set(uri, detail);
        }
        state.artistsExpanded++;
        emit();
      },
      cancel
    );
    state.phase = "done";
    emit();
    return state;
  }
  function byDateDesc(a, b) {
    return (b.releaseDate || "").localeCompare(a.releaseDate || "");
  }

  // ../shared/src/lib/filters.ts
  var FILTERS = [
    { key: "all", label: "All" },
    { key: "album", label: "Albums" },
    { key: "single", label: "Singles and EPs" },
    { key: "compilation", label: "Compilations" }
  ];
  function matchesFilter(album, filter) {
    if (filter === "all")
      return true;
    const type = (album.type || "").toUpperCase();
    if (filter === "single")
      return type === "SINGLE" || type === "EP";
    return type === filter.toUpperCase();
  }
  function sortAlbums(albums, sort) {
    const copy = [...albums];
    if (sort === "name")
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    const direction = sort === "date-asc" ? 1 : -1;
    return copy.sort((a, b) => (a.releaseDate || "").localeCompare(b.releaseDate || "") * direction);
  }

  // ../shared/src/components/catalogue_page.tsx
  var TOP_BAR = 64;
  function labelFromLocation() {
    const search = Spicetify.Platform.History.location?.search ?? "";
    const value = new URLSearchParams(search).get("label");
    return value ? decodeURIComponent(value) : "";
  }
  function progressText(state) {
    if (!state)
      return "";
    switch (state.phase) {
      case "searching":
        return "Searching\u2026";
      case "verifying":
        return `Checking ${state.candidatesChecked}/${state.candidatesTotal} candidates\u2026`;
      case "expanding":
        return `Following artist discographies ${state.artistsExpanded}/${state.artistsTotal}\u2026`;
      default:
        return "";
    }
  }
  function useActiveRelease(listRef, deps) {
    const [activeUri, setActiveUri] = import_react2.default.useState(null);
    import_react2.default.useEffect(() => {
      const list = listRef.current;
      if (!list)
        return;
      let frame = 0;
      const measure = () => {
        frame = 0;
        const line = TOP_BAR + 56;
        let current = null;
        for (const section of list.querySelectorAll("[data-release-uri]")) {
          if (section.getBoundingClientRect().top <= line)
            current = section.dataset.releaseUri ?? null;
          else
            break;
        }
        setActiveUri(current);
      };
      const onScroll = () => {
        if (!frame)
          frame = requestAnimationFrame(measure);
      };
      document.addEventListener("scroll", onScroll, true);
      measure();
      return () => {
        document.removeEventListener("scroll", onScroll, true);
        if (frame)
          cancelAnimationFrame(frame);
      };
    }, deps);
    return activeUri;
  }
  var CataloguePage = ({ label }) => {
    const [state, setState] = import_react2.default.useState(null);
    const [error, setError] = import_react2.default.useState(null);
    const [filter, setFilter] = import_react2.default.useState("all");
    const [sort, setSort] = import_react2.default.useState("date-desc");
    const listRef = import_react2.default.useRef(null);
    import_react2.default.useEffect(() => {
      if (!label) {
        setState(null);
        return;
      }
      const cancel = { cancelled: false };
      setState(null);
      setError(null);
      buildCatalogue(label, (next) => {
        if (!cancel.cancelled)
          setState(next);
      }, cancel).catch((e) => {
        if (!cancel.cancelled)
          setError(e.message);
      });
      return () => {
        cancel.cancelled = true;
      };
    }, [label]);
    const albums = state?.albums ?? [];
    const visible = import_react2.default.useMemo(
      () => sortAlbums(albums.filter((a) => matchesFilter(a, filter)), sort),
      [albums, filter, sort]
    );
    const activeUri = useActiveRelease(listRef, [visible.length, label]);
    const active = import_react2.default.useMemo(() => visible.find((a) => a.uri === activeUri) ?? null, [visible, activeUri]);
    const { Chip } = runtimeComponents();
    if (!label) {
      return /* @__PURE__ */ import_react2.default.createElement("div", {
        className: "label-catalog label-catalog--empty"
      }, /* @__PURE__ */ import_react2.default.createElement("h1", null, "Label catalogue"), /* @__PURE__ */ import_react2.default.createElement("p", null, "Open this page from the label link on any release."));
    }
    const busy = state !== null && state.phase !== "done";
    return /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog"
    }, /* @__PURE__ */ import_react2.default.createElement("header", {
      className: "label-catalog__header"
    }, /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__eyebrow"
    }, "Label"), /* @__PURE__ */ import_react2.default.createElement("h1", {
      className: "label-catalog__title"
    }, label), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__count"
    }, albums.length, " release", albums.length === 1 ? "" : "s", busy && /* @__PURE__ */ import_react2.default.createElement("span", {
      className: "label-catalog__progress"
    }, " \xB7 ", progressText(state)))), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__sticky"
    }, active && /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__nowbar"
    }, /* @__PURE__ */ import_react2.default.createElement("button", {
      className: "label-catalog__nowbar-play",
      onClick: () => Spicetify.Player.playUri(active.uri),
      "aria-label": `Play ${active.name}`
    }, /* @__PURE__ */ import_react2.default.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "22",
      height: "22",
      fill: "currentColor",
      "aria-hidden": "true"
    }, /* @__PURE__ */ import_react2.default.createElement("path", {
      d: "M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"
    }))), /* @__PURE__ */ import_react2.default.createElement("span", {
      className: "label-catalog__nowbar-title"
    }, active.name)), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__controls"
    }, /* @__PURE__ */ import_react2.default.createElement("span", {
      className: "label-catalog__sticky-name"
    }, label), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__chips"
    }, FILTERS.map(({ key, label: text }) => /* @__PURE__ */ import_react2.default.createElement(Chip, {
      key,
      selected: filter === key,
      selectedColorSet: "invertedLight",
      onClick: () => setFilter(key)
    }, text))), /* @__PURE__ */ import_react2.default.createElement("select", {
      className: "label-catalog__sort",
      value: sort,
      onChange: (e) => setSort(e.target.value)
    }, /* @__PURE__ */ import_react2.default.createElement("option", {
      value: "date-desc"
    }, "Release date \u2014 newest"), /* @__PURE__ */ import_react2.default.createElement("option", {
      value: "date-asc"
    }, "Release date \u2014 oldest"), /* @__PURE__ */ import_react2.default.createElement("option", {
      value: "name"
    }, "Alphabetical")))), state && state.rejected > 0 && /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__notice"
    }, state.rejected, " search ", state.rejected === 1 ? "result" : "results", " belonged to a different label and", " ", state.rejected === 1 ? "was" : "were", " dropped."), error && /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__error"
    }, "Could not load the catalogue: ", error), /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__list",
      ref: listRef
    }, visible.map((album) => /* @__PURE__ */ import_react2.default.createElement(release_row_default, {
      key: album.uri,
      album
    }))), state?.phase === "done" && visible.length === 0 && /* @__PURE__ */ import_react2.default.createElement("div", {
      className: "label-catalog__notice"
    }, "Nothing on this label matches that filter."));
  };
  var catalogue_page_default = CataloguePage;

  // src/label_link.ts
  var ROUTE = "/label-catalog";
  var HASH_STORAGE_KEY2 = "label-catalog:searchAlbums-hash";
  var MARKER = "data-label-link";
  var META_ROW = ".main-entityHeader-metaData";
  function catalogueHref(label) {
    return `${ROUTE}?label=${encodeURIComponent(label)}`;
  }
  function injectStyles() {
    if (document.getElementById("label-link-styles"))
      return;
    const style = document.createElement("style");
    style.id = "label-link-styles";
    style.textContent = `
		/* Reads as a link but stays subdued, so it does not compete with the
		   bold artist credits next to it. */
		.label-link a {
			color: var(--text-subdued, #a7a7a7);
			text-decoration: none;
		}
		.label-link a:hover,
		.label-link a:focus-visible {
			color: var(--text-base, #fff);
			text-decoration: underline;
		}

		/* Spicetify gives every custom app a nav button. Ours would open the
		   catalogue with no label selected, which is a dead end, so hide it \u2014
		   the page is reached from the label link on a release instead. */
		.spicetify-sc-scroller button[aria-label="Label"] {
			display: none;
		}

		/* Spotify prints the trailing metadata block with a "\u2022" ::before while
		   also emitting a real separator span before it, and relies on a
		   class-scoped rule to hide one of them. Spicetify rewrites those
		   generated class names, the rule stops matching, and an extra bullet
		   appears \u2014 visible even with no extensions loaded. Drop the duplicate. */
		.main-entityHeader-metaData > span + .main-entityHeader-metaDataText::before {
			content: none;
		}
	`;
    document.head.appendChild(style);
  }
  function startLabelLink() {
    let navigationToken = 0;
    captureSearchAlbumsHash();
    Spicetify.Platform.History.listen(onNavigate);
    onNavigate();
    function captureSearchAlbumsHash() {
      const original = window.fetch;
      window.fetch = function(...args) {
        try {
          const body = args[1]?.body;
          if (typeof body === "string" && body.includes('"searchAlbums"')) {
            const hash = JSON.parse(body)?.extensions?.persistedQuery?.sha256Hash;
            if (hash && hash !== localStorage.getItem(HASH_STORAGE_KEY2)) {
              localStorage.setItem(HASH_STORAGE_KEY2, hash);
            }
          }
        } catch {
        }
        return original.apply(this, args);
      };
    }
    function albumIdFromPath() {
      const match = (Spicetify.Platform.History.location?.pathname || "").match(/^\/album\/([A-Za-z0-9]+)/);
      return match ? match[1] : null;
    }
    function onNavigate() {
      const token = ++navigationToken;
      document.querySelectorAll(`[${MARKER}]`).forEach((node) => node.remove());
      const albumId = albumIdFromPath();
      if (!albumId)
        return;
      let attempts = 0;
      const timer = setInterval(() => {
        if (token !== navigationToken || ++attempts > 40) {
          clearInterval(timer);
          return;
        }
        const row = document.querySelector(META_ROW);
        if (!row || row.children.length < 2)
          return;
        clearInterval(timer);
        void inject(row, albumId, token);
      }, 250);
    }
    async function inject(row, albumId, token) {
      if (row.querySelector(`[${MARKER}]`))
        return;
      let label;
      try {
        const response = await Spicetify.GraphQL.Request(Spicetify.GraphQL.Definitions.getAlbum, {
          uri: `spotify:album:${albumId}`,
          locale: "",
          offset: 0,
          limit: 1
        });
        label = response?.data?.albumUnion?.label;
      } catch (error) {
        console.error("[label-link] could not resolve label", error);
        return;
      }
      if (!label || token !== navigationToken || !row.isConnected)
        return;
      if (row.querySelector(`[${MARKER}]`))
        return;
      const children = [...row.children];
      const separatorIndex = children.findIndex((node) => (node.textContent || "").trim() === "\u2022");
      const lastCredit = children[separatorIndex - 1];
      const separator = children[separatorIndex];
      const valueNode = children[separatorIndex + 1];
      if (!lastCredit || !separator || !valueNode)
        return;
      const ownSeparator = separator.cloneNode(true);
      ownSeparator.setAttribute(MARKER, albumId);
      const holder = valueNode.cloneNode(false);
      holder.setAttribute(MARKER, albumId);
      holder.classList.add("label-link");
      const link = document.createElement("a");
      link.textContent = label;
      link.href = catalogueHref(label);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        Spicetify.Platform.History.push(catalogueHref(label));
      });
      holder.appendChild(link);
      lastCredit.after(ownSeparator);
      ownSeparator.after(holder);
    }
  }

  // src/app.tsx
  var CONTAINER_SELECTORS = [".main-view-container__scroll-node-child", ".main-view-container"];
  function findContainer() {
    for (const selector of CONTAINER_SELECTORS) {
      const node = document.querySelector(selector);
      if (node)
        return node;
    }
    return null;
  }
  function ready() {
    return Boolean(Spicetify?.Platform?.History) && typeof Spicetify?.GraphQL?.Request === "function";
  }
  function main() {
    if (!ready()) {
      setTimeout(main, 300);
      return;
    }
    injectStyles();
    startLabelLink();
    let host = null;
    let root = null;
    const unmount = () => {
      root?.unmount();
      root = null;
      host?.remove();
      host = null;
    };
    const sync = () => {
      const onRoute = Spicetify.Platform.History.location?.pathname === ROUTE;
      if (!onRoute) {
        if (root)
          unmount();
        return;
      }
      const label = labelFromLocation();
      if (root) {
        root.render(/* @__PURE__ */ import_react3.default.createElement(catalogue_page_default, {
          label
        }));
        return;
      }
      setTimeout(() => {
        if (Spicetify.Platform.History.location?.pathname !== ROUTE)
          return;
        const container = findContainer();
        if (!container || container.querySelector(".label-catalog"))
          return;
        host = document.createElement("div");
        host.className = "label-catalog-host";
        container.append(host);
        const ReactDOM = Spicetify.ReactDOM;
        root = ReactDOM.createRoot ? ReactDOM.createRoot(host) : {
          render: (node) => ReactDOM.render(node, host),
          unmount: () => ReactDOM.unmountComponentAtNode(host)
        };
        root.render(/* @__PURE__ */ import_react3.default.createElement(catalogue_page_default, {
          label: labelFromLocation()
        }));
      }, 250);
    };
    Spicetify.Platform.History.listen(sync);
    sync();
  }
  var app_default = main;

  // ../../../../../../../private/var/folders/30/pz7krdq97ydbcz34t0qnymvh0000gn/T/spicetify-creator/index.jsx
  (async () => {
    await app_default();
  })();
})();
(async () => {
    if (!document.getElementById(`labelDcatalog`)) {
      var el = document.createElement('style');
      el.id = `labelDcatalog`;
      el.textContent = (String.raw`
  /* ../../../../../../../private/var/folders/30/pz7krdq97ydbcz34t0qnymvh0000gn/T/tmp-26262-2gseMbsx4BtY/19fcc4bb08f0/catalogue.css */
.Root__top-container:has(.label-catalog) .main-topBar-background {
  --background-base: var(--spice-main, #121212) !important;
  background-color: var(--spice-main, #121212) !important;
}
.label-catalog {
  padding: 0 32px 64px;
}
.label-catalog--empty {
  padding-top: 64px;
  opacity: 0.7;
}
.label-catalog__header {
  padding: 24px 0 8px;
}
.label-catalog__eyebrow,
.label-catalog__count {
  color: var(--text-subdued, #a7a7a7);
  font-size: 0.875rem;
  line-height: 1.4;
}
.label-catalog__title {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  margin: 4px 0 8px;
}
.label-catalog__progress {
  opacity: 0.75;
}
.label-catalog__sticky {
  position: sticky;
  top: 64px;
  z-index: 2;
  background: #121212;
}
.label-catalog__nowbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}
.label-catalog__nowbar-play {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border: 0;
  border-radius: 50%;
  background: var(--spice-button, #1ed760);
  color: #000;
  cursor: pointer;
  transition: transform 0.1s ease;
}
.label-catalog__nowbar-play:hover {
  transform: scale(1.05);
}
.label-catalog__nowbar-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.label-catalog__sticky-name {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-right: 8px;
  flex-shrink: 0;
}
.label-catalog__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: nowrap;
  padding: 12px 0 20px;
}
.label-catalog__chips {
  display: flex;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.label-catalog__chips::-webkit-scrollbar {
  display: none;
}
.label-catalog__sort {
  flex-shrink: 0;
  background: transparent;
  color: var(--text-subdued, #a7a7a7);
  border: 0;
  font-size: 0.875rem;
  cursor: pointer;
}
.label-catalog__sort option {
  background: var(--spice-card, #181818);
  color: var(--spice-text, #fff);
}
.label-catalog__list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.label-catalog__notice,
.label-catalog__error {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
}
.label-catalog__notice {
  background: rgba(255, 255, 255, 0.07);
}
.label-catalog__error {
  background: rgba(226, 33, 52, 0.15);
}
.release-row__head {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.release-row__cover {
  width: 148px;
  height: 148px;
  -o-object-fit: cover;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  flex-shrink: 0;
}
.release-row__info {
  min-width: 0;
  padding-top: 8px;
}
.release-row__title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
  cursor: pointer;
}
.release-row__title:hover {
  text-decoration: underline;
}
.release-row__meta {
  color: var(--text-subdued, #a7a7a7);
  font-size: 0.875rem;
  margin-bottom: 16px;
}
.release-row__play {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: var(--spice-button, #1ed760);
  color: #000;
  cursor: pointer;
  transition: transform 0.1s ease;
}
.release-row__play:hover {
  transform: scale(1.05);
}
.release-row__tracks {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.release-row__tracks thead th {
  color: var(--text-subdued, #a7a7a7);
  font-weight: 400;
  text-align: left;
  padding: 4px 8px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.release-row__tracks tbody tr {
  cursor: default;
}
.release-row__tracks tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}
.release-row__tracks tbody td {
  padding: 8px;
  vertical-align: middle;
}
.release-row__col-num {
  width: 40px;
  color: var(--text-subdued, #a7a7a7);
  text-align: center;
  position: relative;
}
.release-row__track-play {
  position: absolute;
  inset: 0;
  display: none;
  place-items: center;
  width: 100%;
  border: 0;
  background: none;
  color: var(--spice-text, #fff);
  cursor: pointer;
}
.release-row__col-menu {
  width: 40px;
  text-align: center;
}
.release-row__track-menu {
  display: none;
  border: 0;
  background: none;
  color: var(--text-subdued, #a7a7a7);
  cursor: pointer;
}
.release-row__track-menu:hover {
  color: var(--spice-text, #fff);
}
.release-row tbody tr:hover .release-row__num {
  visibility: hidden;
}
.release-row tbody tr:hover .release-row__track-play,
.release-row tbody tr:hover .release-row__track-menu {
  display: grid;
  place-items: center;
  margin: 0 auto;
}
.release-row__col-plays {
  width: 140px;
  text-align: right;
  color: var(--text-subdued, #a7a7a7);
  font-variant-numeric: tabular-nums;
}
.release-row__col-time {
  width: 70px;
  text-align: right;
  color: var(--text-subdued, #a7a7a7);
  font-variant-numeric: tabular-nums;
}
.release-row__track-name {
  color: var(--spice-text, #fff);
}
.release-row__track-artist {
  color: var(--text-subdued, #a7a7a7);
  font-size: 0.8125rem;
}
.release-row__credit {
  color: inherit;
  text-decoration: none;
}
.release-row__credit:hover {
  color: var(--spice-text, #fff);
  text-decoration: underline;
}
.release-row__actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
.release-row__action {
  border: 0;
  background: none;
  color: var(--text-subdued, #a7a7a7);
  cursor: pointer;
  display: grid;
  place-items: center;
}
.release-row__action:hover {
  color: var(--spice-text, #fff);
  transform: scale(1.04);
}
.release-row__action--on {
  color: var(--spice-button, #1ed760);
}

      `).trim();
      document.head.appendChild(el);
    }
  })()
      })();