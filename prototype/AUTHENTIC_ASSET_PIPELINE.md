# Authentic photo asset pipeline

This directory converts the rights-approved Wikimedia Commons sources in `authentic-assets.json` into same-origin WebP derivatives for the archival homepage proof.

## Rules enforced

- Real people, events, arenas and championship history come from authentic photography.
- The script may resize, normalize EXIF orientation, remove metadata and compress.
- It may not crop, retouch, inpaint, generate, replace or reconstruct any real person, clothing, hands, championship belt, arena or event.
- Files with unresolved rights or misleading context are excluded from the configuration.
- The Vince McMahon magazine scans remain excluded because their public-domain analysis is clearly U.S.-specific.
- The 2008 WWE-era ECW belt remains excluded from original-ECW presentation.

## Build

```bash
python -m pip install -r prototype/requirements-authentic-assets.txt
python prototype/fetch-authentic-assets.py
```

The script writes responsive WebP derivatives to `prototype/assets/photos/` and a checksum/attribution record to `PHOTO_DERIVATIVE_MANIFEST.csv`.

The generated binaries should be committed only after the exact-source, desktop crop, 390-pixel crop, alt-text, performance and historical-caption gates pass.
