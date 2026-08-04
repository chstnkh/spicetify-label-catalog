"""Builds the icon for the patched client.

The two apps sit side by side in the Dock under near-identical names, so the icon
carries the distinction: the artwork is inverted — the black plate becomes green
and the green disc becomes black.

The swap is done by projecting each pixel onto the black↔green axis and flipping
its position along it, rather than matching exact colours. That keeps the
anti-aliased edges clean instead of leaving a jagged halo.

Usage: python3 scripts/make-icon.py <source.icns> <output.icns>
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image

GREEN = (30, 215, 96)
DARK = (18, 18, 18)


def invert_palette(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size

    axis = tuple(GREEN[i] - DARK[i] for i in range(3))
    axis_len_sq = sum(component * component for component in axis)

    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # How far along black→green this pixel sits (0 = black, 1 = green).
            offset = (r - DARK[0], g - DARK[1], b - DARK[2])
            t = sum(offset[i] * axis[i] for i in range(3)) / axis_len_sq
            t = min(1.0, max(0.0, t))
            flipped = 1.0 - t
            pixels[x, y] = (
                int(DARK[0] + axis[0] * flipped),
                int(DARK[1] + axis[1] * flipped),
                int(DARK[2] + axis[2] * flipped),
                a,
            )
    return image


def main() -> None:
    source, output = Path(sys.argv[1]), Path(sys.argv[2])
    work = output.parent / "build.iconset"
    staging = output.parent / "src.iconset"

    for path in (work, staging):
        subprocess.run(["rm", "-rf", str(path)], check=True)
    subprocess.run(["iconutil", "-c", "iconset", str(source), "-o", str(staging)], check=True)
    work.mkdir(parents=True)

    for png in sorted(staging.glob("*.png")):
        invert_palette(Image.open(png)).save(work / png.name)
        print(f"  {png.name}")

    subprocess.run(["iconutil", "-c", "icns", str(work), "-o", str(output)], check=True)
    print(f"wrote {output}")


if __name__ == "__main__":
    main()
