# Paryatech brand assets

Four supplied logo forms, 14 variants and 22 original files.

| Form | Variants | Supplied formats | Original dimensions |
| --- | --- | --- | --- |
| Horizontal logo | Teal, black, white, pale pink | SVG and transparent PNG | SVG 1193 × 259; PNG 2385 × 517 |
| Stacked logo | Deep teal, black, white, pale pink | SVG and transparent PNG | 1200 × 700 |
| Standalone symbol | Teal, black, white, pale pink | Transparent PNG | 840 × 840 |
| App tile | Teal on pale pink; white on teal | SVG with background | 387 × 387 |

Choose horizontal logos for wide spaces and stacked logos for centered layouts. Use the supplied standalone symbol where the Paryatech brand is already clear. App tiles retain their square background artwork.

SVG stays sharp when resized. PNG is useful for slides, documents and tools that do not accept SVG; use it at its native size or smaller. Download links include only the formats supplied. The standalone symbol has no supplied SVG, and the app tiles have no supplied PNG.

## Colors

- Horizontal and standalone-symbol teal: #115553.
- Stacked deep teal: #154442, exactly as supplied in the stacked export.
- Black: #000000. White: #FFFFFF. Pale pink: #F8DEE8.
- App tiles pair teal #115553 with pale pink #F8DEE8, or white with teal #115553.

Use teal or black on light surfaces and white or pale pink on dark surfaces. Preserve the app tiles' supplied backgrounds. These are file-specific color values; the files have not been recolored to make the two teal exports identical.

Keep original proportions and colors. Keep horizontal and stacked lockups intact. Avoid stretching, rotation, added effects and cropping the downloadable artwork. Leave surrounding space and check legibility at the final size. An approved minimum size and clear-space specification have not been provided.

## File provenance

Files are preserved byte-for-byte with descriptive filenames. Current horizontal logos: Group 39 (white), Group 40 (black), Group 41 (pale pink), Group 42 (teal), from paryatech logog.zip. These full wordmarks include P. Earlier horizontal exports 13–16 have been replaced. Standalone symbol exports remain 17–20; stacked exports remain 21–24. The app tiles were supplied as Frame 2147224932.svg and Frame 2147224948.svg. The documentation and AppShell headers use exact copies of the current teal and white horizontal SVG files.

manifest.json records each original file's dimensions (per format when PNG and SVG sizes differ), available format, byte size and SHA-256 hash. All three download packs include this manifest and these usage notes. The intake comparison is recorded in design/brand-asset-intake-2026-10-29.json in the source repository.

For maintainers: after updating the source manifest or files, run `python scripts/build-brand-assets.py` from the repository. It verifies original hashes, dimensions and duplicates, synchronizes the public manifest, and rebuilds all three packs. It uses Python's standard library only.
