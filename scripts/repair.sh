#!/bin/zsh
# (Re)builds the patched client, "Spotify Label.app", from whatever state it is in.
#
# Why this exists: Spotify's own updater replaces the *running* app bundle in
# place. When it ran against Spotify Label.app it swapped in a pristine, officially
# signed build — which silently discarded the Spicetify patch, the custom bundle
# identifier and the inverted icon. This script puts all of that back, and blocks
# the updater so it cannot happen again.
#
# Safe to run repeatedly. It only ever writes to Spotify Label.app and to
# ~/.config/spicetify; the stock /Applications/Spotify.app is read, never modified.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="/Applications/Spotify Label.app"
STOCK="/Applications/Spotify.app"
PLIST="$APP/Contents/Info.plist"
LABEL_ID="com.spotify.client.label"
SPICETIFY_DIR="$HOME/.config/spicetify"
CONFIG="$SPICETIFY_DIR/config-xpui.ini"

step() { echo "▸ $*"; }

# spicetify prints progress bars with carriage returns; keep them out of the way
# and only surface the output when something fails.
run_spicetify() {
  local log; log="$(mktemp)"
  if ! spicetify "$@" >"$log" 2>&1; then
    sed 's/\x1b\[[0-9;]*m//g' "$log" | tail -15 >&2
    rm -f "$log"
    echo "spicetify $* failed" >&2
    exit 1
  fi
  rm -f "$log"
}

# Adds an item to a Spicetify list setting without clobbering what is already there
# (`spicetify config extensions x.js` would otherwise replace the whole list).
ensure_listed() {
  local key="$1" item="$2" current
  current="$(sed -n "s/^${key}[[:space:]]*=[[:space:]]*//p" "$CONFIG" | head -1 | sed 's/[[:space:]]*$//')"
  case "|$current|" in
    *"|$item|"*) return 0 ;;
  esac
  run_spicetify config "$key" "${current:+$current|}$item"
}

plist_set() {
  /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PLIST" 2>/dev/null ||
    /usr/libexec/PlistBuddy -c "Add :$1 string $2" "$PLIST"
}

command -v spicetify >/dev/null || { echo "spicetify is not installed — see https://spicetify.app" >&2; exit 1; }
[[ -d "$STOCK" ]] || { echo "$STOCK not found; nothing to base the patched client on" >&2; exit 1; }

# Never operate on the everyday client, whatever the config says.
[[ "$APP" != "$STOCK" ]] || { echo "refusing to patch the stock app" >&2; exit 1; }

step "stopping Spotify Label (the stock Spotify is left alone)"
pkill -f "Spotify Label.app/Contents/MacOS/Spotify" 2>/dev/null || true
sleep 2

if [[ ! -d "$APP" ]]; then
  step "creating $APP from the stock app"
  ditto "$STOCK" "$APP"
fi

step "building the extension and custom app"
(cd "$ROOT" && npm run build --silent)

step "linking them into Spicetify"
mkdir -p "$SPICETIFY_DIR/Extensions" "$SPICETIFY_DIR/CustomApps"
ln -sfn "$ROOT/projects/label-link/dist/label-catalog.js" "$SPICETIFY_DIR/Extensions/label-catalog.js"
ln -sfn "$ROOT/projects/label-catalog/dist" "$SPICETIFY_DIR/CustomApps/label-catalog"

step "pointing Spicetify at Spotify Label"
[[ -f "$CONFIG" ]] || spicetify >/dev/null 2>&1 || true   # first run writes a default config
run_spicetify config spotify_path "$APP/Contents/Resources"
ensure_listed extensions label-catalog.js
ensure_listed custom_apps label-catalog

# An unpatched bundle still carries xpui.spa; once Spicetify has patched it the
# archive is unpacked into an xpui/ directory instead. That tells a freshly
# updated bundle (needs a full re-patch, against a fresh backup) from one that
# merely needs the latest build re-applied.
if [[ -f "$APP/Contents/Resources/Apps/xpui.spa" ]]; then
  step "bundle is unpatched (an update replaced it) — patching from a fresh backup"
  run_spicetify clear
  run_spicetify backup apply -n
else
  step "bundle is already patched — re-applying the latest build"
  run_spicetify apply -n
fi

step "blocking Spotify's self-updater in this copy only"
run_spicetify spotify-updates block

step "restoring identity: bundle id, name, inverted icon"
plist_set CFBundleIdentifier "$LABEL_ID"
plist_set CFBundleName "Spotify Label"
plist_set CFBundleDisplayName "Spotify Label"

# Always invert the *stock* icon. Inverting the current one would flip an
# already-inverted icon straight back to green.
if python3 -c "import PIL" 2>/dev/null; then
  icon_tmp="$(mktemp -d)"
  python3 "$ROOT/scripts/make-icon.py" "$STOCK/Contents/Resources/AppIcon.icns" "$icon_tmp/Inverted.icns" >/dev/null
  cp "$icon_tmp/Inverted.icns" "$APP/Contents/Resources/AppIcon.icns"
  rm -rf "$icon_tmp"
else
  echo "  (skipping the inverted icon: needs Pillow — pip3 install pillow)"
fi

# Signing comes last so the signature seals everything above. Editing the bundle
# invalidates the original one, and launchd refuses to spawn it (RBS error 153).
step "re-signing ad hoc"
codesign --force --deep --sign - "$APP" 2>&1 | grep -v "replacing existing signature" || true
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP" >/dev/null 2>&1 || true
touch "$APP"

echo "✓ Spotify Label is ready — start it with: npm start"
