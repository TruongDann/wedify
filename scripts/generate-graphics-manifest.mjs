// Quét public/graphics và sinh src/data/graphicsManifest.ts (danh sách file theo thư mục).
// Chạy lại sau khi thêm/xóa file: npm run graphics:manifest
import { readdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const graphicsDir = join(root, "public", "graphics");
const outFile = join(root, "src", "data", "graphicsManifest.ts");

const collator = new Intl.Collator("en", { numeric: true });

const manifest = {};
for (const dir of readdirSync(graphicsDir).sort()) {
  const full = join(graphicsDir, dir);
  if (!statSync(full).isDirectory()) continue;
  manifest[dir] = readdirSync(full)
    .filter((f) => /\.(webp|svg|png|jpe?g)$/i.test(f))
    .sort(collator.compare);
}

const body = `/* eslint-disable */
// File tự sinh bởi scripts/generate-graphics-manifest.mjs — không sửa tay.
export const GRAPHICS_MANIFEST: Record<string, string[]> = ${JSON.stringify(manifest, null, 2)};
`;

writeFileSync(outFile, body);
console.log(
  `Wrote ${outFile}: ${Object.keys(manifest).length} folders, ${Object.values(manifest).flat().length} files`,
);
