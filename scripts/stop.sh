#!/bin/zsh
# Stops the patched client and brings the stock Spotify back.
set -e

# Unescaped and pinned to the executable path — BSD pkill exits 0 without
# killing anything when the pattern contains `\.`.
pkill -f "Spotify Label.app/Contents/MacOS/Spotify" 2>/dev/null || true
sleep 3

open -a /Applications/Spotify.app
echo "Spotify Label stopped, stock Spotify is back."
