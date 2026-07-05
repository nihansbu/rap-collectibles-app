from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_hex_color(value: str) -> tuple[int, int, int]:
    clean = value.strip().lstrip("#")
    if len(clean) != 6:
        raise ValueError("Expected a 6-digit hex color such as #00ff00")
    return int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16)


def color_distance(pixel: tuple[int, int, int], key: tuple[int, int, int]) -> int:
    return max(abs(pixel[0] - key[0]), abs(pixel[1] - key[1]), abs(pixel[2] - key[2]))


def remove_key(image: Image.Image, key: tuple[int, int, int], threshold: int) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()

    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0:
                continue
            distance = color_distance((red, green, blue), key)
            if distance <= threshold:
                pixels[x, y] = (red, green, blue, 0)
            elif distance <= threshold * 3:
                fade = min(255, int(255 * (distance - threshold) / max(1, threshold * 2)))
                pixels[x, y] = (red, green, blue, min(alpha, fade))

    return rgba


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A")
    return alpha.getbbox()


def normalize_icon(input_path: Path, output_path: Path, key: tuple[int, int, int], threshold: int, canvas_size: int, max_subject_size: int) -> None:
    keyed = remove_key(Image.open(input_path), key, threshold)
    bbox = alpha_bbox(keyed)
    if bbox is None:
      raise ValueError(f"No non-transparent subject remained after key removal: {input_path}")

    subject = keyed.crop(bbox)
    subject.thumbnail((max_subject_size, max_subject_size), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    left = (canvas_size - subject.width) // 2
    top = (canvas_size - subject.height) // 2
    canvas.alpha_composite(subject, (left, top))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, "WEBP", quality=90, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize a chroma-key generated icon into a transparent 256x256 WebP.")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--key", default="#00ff00")
    parser.add_argument("--threshold", default=18, type=int)
    parser.add_argument("--canvas-size", default=256, type=int)
    parser.add_argument("--max-subject-size", default=220, type=int)
    args = parser.parse_args()

    normalize_icon(
        input_path=args.input,
        output_path=args.out,
        key=parse_hex_color(args.key),
        threshold=args.threshold,
        canvas_size=args.canvas_size,
        max_subject_size=args.max_subject_size,
    )


if __name__ == "__main__":
    main()

