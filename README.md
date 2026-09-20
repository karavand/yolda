# Automatic PNG → WebP Converter

This repository setup automatically converts PNG files inside:

```text
assets/icons/
```

into **real WebP images** using GitHub Actions.

## What it does

When you push a PNG such as:

```text
assets/icons/home.png
```

GitHub Actions automatically converts it to:

```text
assets/icons/home.webp
```

and removes the original PNG.

Subfolders are supported:

```text
assets/icons/food/pizza.png
assets/icons/pharmacy/medicine.png
```

become:

```text
assets/icons/food/pizza.webp
assets/icons/pharmacy/medicine.webp
```

The generated files are genuine WebP files, not renamed PNGs.

Conversion uses:

- Pillow
- WebP encoder
- Lossless WebP
- Transparency preservation
- Maximum WebP encoding effort (`method=6`)

## Installation

Copy these files into the root of your GitHub repository.

Your repository should contain:

```text
.github/
  workflows/
    convert-webp.yml

scripts/
  convert_to_webp.py

assets/
  icons/
```

## GitHub permission

Open your repository and go to:

```text
Settings
→ Actions
→ General
→ Workflow permissions
```

Select:

```text
Read and write permissions
```

Then click **Save**.

This lets GitHub Actions commit the generated WebP files back to your repository.

## Usage

Simply add PNG files to:

```text
assets/icons/
```

and push:

```bash
git add .
git commit -m "add icons"
git push
```

Then open the **Actions** tab on GitHub.

The workflow will automatically:

1. Find PNG files in `assets/icons/`
2. Decode the PNG image
3. Encode it as lossless WebP
4. Preserve transparency
5. Delete the source PNG
6. Commit the generated WebP file

## Branch

The workflow currently watches:

```text
main
```

If your default branch is called `master`, edit:

```text
.github/workflows/convert-webp.yml
```

and replace:

```yaml
branches:
  - main
```

with:

```yaml
branches:
  - master
```
