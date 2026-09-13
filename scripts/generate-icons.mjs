// Generates every PWA/home-screen icon from public/football.svg.
//
// Run manually with `pnpm gen:icons` and commit the PNGs — icons change
// roughly never, and keeping this out of `build` spares Vercel a native dep.
//
// Three rules drive the odd-looking bits below:
//   - iOS paints alpha as black, not as the page background, so the
//     apple-touch icon must be flattened onto an opaque plate.
//   - Android masks "maskable" icons to a device-chosen shape, so the
//     artwork has to stay inside the central 80% safe zone.
//   - "any" and "maskable" must be separate files; a single icon declaring
//     both makes Chrome use the padded, plated art in unmasked contexts too.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "public", "football.svg");
const OUT = join(root, "public", "icons");

const PLATE = "#ffffff"; // matches manifest background_color
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

// The source is a 450x483 viewBox. Rasterise well above the largest target
// and let lanczos downsample, otherwise the gradients band at small sizes.
const DENSITY = 400;

/** Render the mark into a transparent box x box PNG buffer. */
function artwork(box) {
  return sharp(SRC, { density: DENSITY })
    .resize(box, box, { fit: "contain", background: TRANSPARENT })
    .png()
    .toBuffer();
}

/** Flatten the mark onto an opaque plate, inset to `scale` of the canvas. */
async function plated(size, scale, file) {
  const inner = Math.round(size * scale);
  const composited = await sharp({
    create: { width: size, height: size, channels: 4, background: PLATE },
  })
    .composite([{ input: await artwork(inner), gravity: "center" }])
    .png()
    .toBuffer();

  // Second pass: sharp runs flatten *before* composite within a single
  // pipeline, so flattening above would strip the plate's alpha and then the
  // transparent artwork would put it straight back.
  await sharp(composited)
    .flatten({ background: PLATE }) // drops alpha — load-bearing for iOS
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, file));
  return file;
}

/** Transparent, full-bleed — the manifest's purpose:"any" icons. */
async function plain(size, file) {
  await sharp(await artwork(size))
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, file));
  return file;
}

await mkdir(OUT, { recursive: true });

const written = await Promise.all([
  plain(192, "icon-192.png"),
  plain(512, "icon-512.png"),
  plated(192, 0.8, "maskable-192.png"),
  plated(512, 0.8, "maskable-512.png"),
  plated(180, 0.8, "apple-touch-icon.png"),
]);

for (const file of written) {
  const { width, height, channels, hasAlpha } = await sharp(
    join(OUT, file),
  ).metadata();
  console.log(
    `  public/icons/${file.padEnd(21)} ${width}x${height} ` +
      `${channels}ch ${hasAlpha ? "alpha" : "opaque"}`,
  );
}
