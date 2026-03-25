import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const iconsDir = path.join(publicDir, "icons");
const screenshotsDir = path.join(publicDir, "screenshots");

function hexToRgba(hex) {
  const h = hex.replace("#", "").trim();
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b, a: 255 };
}

async function writeSolidPng(outPath, width, height, hexColor) {
  const { r, g, b, a } = hexToRgba(hexColor);
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  const buffer = PNG.sync.write(png, { colorType: 6 });
  await writeFile(outPath, buffer);
}

async function main() {
  await mkdir(iconsDir, { recursive: true });
  await mkdir(screenshotsDir, { recursive: true });

  // Ícones do manifest (purpose maskable). Placeholders sólidos.
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  await Promise.all(
    iconSizes.map((size) =>
      writeSolidPng(
        path.join(iconsDir, `icon-${size}x${size}.png`),
        size,
        size,
        "#e8325f"
      )
    )
  );

  // Badge usado no SW
  await writeSolidPng(path.join(iconsDir, "badge-72x72.png"), 72, 72, "#111827");

  // Ícones de atalho no manifest
  await writeSolidPng(path.join(iconsDir, "shortcut-event.png"), 96, 96, "#7c3aed");
  await writeSolidPng(
    path.join(iconsDir, "shortcut-gallery.png"),
    96,
    96,
    "#0ea5e9"
  );

  // Screenshots do manifest (placeholders)
  await writeSolidPng(
    path.join(screenshotsDir, "desktop.png"),
    1280,
    800,
    "#0f172a"
  );
  await writeSolidPng(
    path.join(screenshotsDir, "mobile.png"),
    390,
    844,
    "#111827"
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

