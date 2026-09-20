from pathlib import Path
from PIL import Image

ICONS_DIR = Path("assets/icons")

converted = 0
failed = 0

if not ICONS_DIR.exists():
    print(f"Directory not found: {ICONS_DIR}")
    raise SystemExit(1)

for image_path in ICONS_DIR.rglob("*"):
    if not image_path.is_file():
        continue

    if image_path.suffix.lower() != ".png":
        continue

    webp_path = image_path.with_suffix(".webp")

    try:
        print(f"Converting: {image_path}")

        with Image.open(image_path) as image:
            # Preserve transparency whenever present
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA")

            image.save(
                webp_path,
                "WEBP",
                lossless=True,
                method=6
            )

        # Remove original PNG after successful conversion
        image_path.unlink()

        print(f"✓ Created: {webp_path}")
        converted += 1

    except Exception as error:
        print(f"✗ Failed: {image_path}")
        print(f"  {error}")
        failed += 1

print("\n-------------------------")
print(f"Converted: {converted}")
print(f"Failed: {failed}")
print("-------------------------")

if failed:
    raise SystemExit(1)
