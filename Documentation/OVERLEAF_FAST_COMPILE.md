## Overleaf free-plan: avoid compile timeouts

Your `.tex` is already set up to compile fast by disabling TikZ/PGFPlots, but **large PNG screenshots** can still time out on Overleaf free plan.

This repo does not currently contain the referenced PNG assets, so you need to generate a **smaller copy set** and upload it to Overleaf.

### 1) Generate compressed copies (Windows)

Install Pillow once:

```bash
python -m pip install --user pillow
```

Run the compressor from the `Documentation/` folder (or pass the folder that contains your images):

```bash
python "compress_images_for_overleaf.py" "PATH_TO_YOUR_IMAGES_FOLDER" --out "compressed" --max-px 2000 --jpeg-quality 80
```

This writes a `compressed/` folder containing downscaled **JPEG** versions of your screenshots (much smaller and faster for Overleaf).
Your `overleaf v5.tex` is now set up to automatically use `foo.jpg` from `compressed/` even if the document references `foo.png`.

### 2) Upload to Overleaf

Upload the entire `compressed/` folder into your Overleaf project root (same place as your main `.tex` file).

Your `.tex` already prefers `compressed/` first via:

```tex
\graphicspath{{compressed/}{./}{Tables/}{Diagrams/}...}
```

### 3) Recompile twice

Forward references (e.g. `\ref{...}` before `\label{...}`) require **two compiles** to resolve.

