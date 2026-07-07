// 用法: node scripts/tv-media.mjs <slug> <posterUrl> <backdropUrl1> <backdropUrl2> ...
// 下载 TMDB 剧集图片，转成 WebP，存到 public/images/tv/<slug>/，并生成卡片缩略图。
// 与 movie-media.mjs 同逻辑，只是路径换成 tv。
import sharp from "sharp";
import { mkdir, stat } from "fs/promises";

const [, , slug, posterUrl, ...backdrops] = process.argv;
if (!slug || !posterUrl) {
  console.error("需要 slug 和 posterUrl");
  process.exit(1);
}
const dir = `public/images/tv/${slug}`;
await mkdir(dir, { recursive: true });

async function dl(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
async function toWebp(url, out, width) {
  const buf = await dl(url);
  await sharp(buf)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`${dir}/${out}`);
  const { size } = await stat(`${dir}/${out}`);
  console.log(`  ${out}  ${Math.round(size / 1024)}KB`);
}

await toWebp(posterUrl, "poster.webp", 600);
let i = 1;
for (const u of backdrops) {
  await toWebp(u, `scene-${i}.webp`, 1280);
  i++;
}

// 生成卡片缩略图 (1600x900 progressive JPEG)，卡片封面用的是 _thumbs 路径，
// 见 src/utils/images.ts -> cardImageSrc；缺缩略图会回退到占位图。
const thumbDir = `public/images/_thumbs/tv/${slug}`;
await mkdir(thumbDir, { recursive: true });
for (const name of ["poster", ...backdrops.map((_, n) => `scene-${n + 1}`)]) {
  await sharp(`${dir}/${name}.webp`)
    .resize(1600, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(`${thumbDir}/${name}.jpg`);
}

console.log(`✓ ${slug}: 1 poster + ${backdrops.length} scenes (+缩略图)`);
