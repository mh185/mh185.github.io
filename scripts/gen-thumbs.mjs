// Generate card thumbnails (1600x900 progressive JPEG, cover-fit) from the
// full-size movie webp images. Card covers use /images/_thumbs/movies/<slug>/<name>.jpg
// (see src/utils/images.ts -> cardImageSrc). Missing thumbs fall back to the
// Great Wall placeholder, so every poster/scene needs a matching thumb.
//
// Usage:
//   node scripts/gen-thumbs.mjs            -> all movie slugs
//   node scripts/gen-thumbs.mjs <slug> ... -> only the given slugs
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_ROOT = "public/images/movies";
const THUMB_ROOT = "public/images/_thumbs/movies";

const only = process.argv.slice(2);
const slugs = only.length
    ? only
    : (await readdir(SRC_ROOT, { withFileTypes: true }))
          .filter((d) => d.isDirectory())
          .map((d) => d.name);

let made = 0;
for (const slug of slugs) {
    const srcDir = path.join(SRC_ROOT, slug);
    if (!existsSync(srcDir)) {
        console.log(`跳过 ${slug}: 源目录不存在`);
        continue;
    }
    const outDir = path.join(THUMB_ROOT, slug);
    await mkdir(outDir, { recursive: true });

    const files = (await readdir(srcDir)).filter((f) => /\.webp$/i.test(f));
    for (const f of files) {
        const name = f.replace(/\.webp$/i, ".jpg");
        const out = path.join(outDir, name);
        await sharp(path.join(srcDir, f))
            .resize(1600, 900, { fit: "cover", position: "attention" })
            .jpeg({ quality: 80, progressive: true, mozjpeg: true })
            .toFile(out);
        made++;
    }
    console.log(`✓ ${slug}: ${files.length} 张缩略图`);
}
console.log(`完成，共生成 ${made} 张缩略图`);
