#!/bin/zsh
# Starts the patched client, "Spotify Label.app".
#
# Spotify enforces a single running instance regardless of where the bundle
# lives, so the stock client has to be closed first — otherwise the patched copy
# exits silently a second after launch.
#
# Launch must go through LaunchServices (`open`), not by executing the binary:
# running the Mach-O directly from a shell starts the process without ever
# creating a window.
#
# Match patterns are unescaped and pinned to the executable path: BSD pkill does
# not treat `\.` the way GNU does — `pkill -f "Spotify Label\.app"` exits 0 while
# killing nothing.
set -e

APP="/Applications/Spotify Label.app"
STOCK_PROC="Applications/Spotify.app/Contents/MacOS/Spotify"
PATCHED_PROC="Spotify Label.app/Contents/MacOS/Spotify"
DEBUG_PORT="${DEBUG_PORT:-}"

# Spotify's own updater replaces the running bundle in place, which discards the
# patch. A bundle that still carries xpui.spa (rather than the unpacked xpui/
# directory Spicetify leaves behind) has been through exactly that — repair it
# before launching, so the feature is never silently missing.
if [[ ! -d "$APP" || -f "$APP/Contents/Resources/Apps/xpui.spa" ]]; then
  echo "Spotify Label is missing or unpatched — repairing first…"
  "$(dirname "$0")/repair.sh"
fi

if pgrep -f "$STOCK_PROC" > /dev/null; then
  echo "Closing the stock Spotify first…"
  pkill -f "$STOCK_PROC" || true
  sleep 4
fi
pkill -f "$PATCHED_PROC" 2>/dev/null || true
sleep 2

if [[ -n "$DEBUG_PORT" ]]; then
  open -n -a "$APP" --args --remote-debugging-port="$DEBUG_PORT"
  echo "Spotify Label starting with DevTools on http://127.0.0.1:$DEBUG_PORT"
else
  open -n -a "$APP"
  echo "Spotify Label starting."
fi
