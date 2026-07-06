// 用法: node scripts/movie-media.mjs <slug> <posterUrl> <backdropUrl1> <backdropUrl2> ...
// 下载 TMDB 图片，转成 WebP，存到 public/images/movies/<slug>/
import sharp from "sharp";
import { mkdir, stat } from "fs/promises";

const [, , slug, posterUrl, ...backdrops] = process.argv;
if (!slug || !posterUrl) {
  console.error("需要 slug 和 posterUrl");
  process.exit(1);
}
const dir = `public/images/movies/${slug}`;
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
console.log(`✓ ${slug}: 1 poster + ${backdrops.length} scenes`);
