import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const imageRoot = path.join(root, "public/images/travel");
const thumbRoot = path.join(root, "public/images/_thumbs/travel");
const rawRoot = path.join(root, "public/images/_replace-travel-raw");
const protectedDirs = new Set([
  "great-wall",
  "forbidden-city",
  "guilin-li-river",
  "jiuzhaigou-valley",
  "zhangjiajie-wulingyuan",
  "huangshan",
  "potala-palace-jokhang-temple",
  "terracotta-army",
  "west-lake-hangzhou",
  "lijiang-old-town",
  "qinghai-lake",
  "mount-tai",
  "mount-hua",
  "mogao-caves-dunhuang",
  "mingsha-mountain-crescent-spring",
  "pingyao-ancient-city",
  "hongcun-xidi",
  "wuyuan-villages",
  "mount-wuyi",
  "suzhou-classical-gardens",
  "mount-emei",
  "leshan-giant-buddha",
  "changbai-mountain-tianchi",
  "wuzhen",
  "dujiangyan",
  "mount-qingcheng",
  "mount-putuo",
  "yungang-grottoes",
  "longmen-grottoes",
  "xishuangbanna-botanical-garden",
  "kanas-lake",
  "zhangye-danxia",
  "chengde-mountain-resort",
  "qinhuai-confucius-temple",
  "shanghai-disney-resort",
  "gulangyu-island",
  "wulong-three-natural-bridges",
  "chongqing-hongya-cave",
  "yalong-bay-sanya",
  "sanya-nanshan-cultural-tourism-zone",
  "libo-xiaoqikong",
]);

function hash(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function textSeed(text) {
  return Number.parseInt(crypto.createHash("sha256").update(text).digest("hex").slice(0, 8), 16);
}

function duplicateFallbackDirs() {
  const groups = new Map();
  for (const dir of fs.readdirSync(imageRoot)) {
    const fullDir = path.join(imageRoot, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    for (const file of fs.readdirSync(fullDir).filter((name) => name.endsWith(".webp"))) {
      const full = path.join(fullDir, file);
      const h = hash(full);
      if (!groups.has(h)) groups.set(h, []);
      groups.get(h).push({ dir, file });
    }
  }
  const dirs = new Set();
  for (const items of groups.values()) {
    if (items.length > 20) {
        for (const item of items) {
          if (!protectedDirs.has(item.dir)) dirs.add(item.dir);
        }
    }
  }
  return [...dirs].sort();
}

function queryFromSlug(slug) {
  return slug
    .replace(/-/g, ",")
    .replace(/mount,/g, "mountain,")
    .replace(/old,street/g, "old street")
    .replace(/national,forest,park/g, "forest park")
    .replace(/historic,centre,of,macau/g, "macau historic center")
    .replace(/victoria,harbour,hong,kong/g, "hong kong victoria harbour")
    .replace(/chimelong/g, "china theme park chimelong")
    .replace(/disneyland/g, "disneyland")
    .replace(/disney,resort/g, "disney resort");
}

async function download(url, out) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "mh185-travel-image-replacer/1.0" },
    signal: controller.signal,
  });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(out, Buffer.from(ab));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadRetry(url, out, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      await download(url, out);
      return true;
    } catch (err) {
      last = err;
      await sleep(500 + i * 800);
    }
  }
  console.warn(`download failed: ${last?.message || url}`);
  return false;
}

async function downloadSet(slug) {
  const rawDir = path.join(rawRoot, slug);
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.mkdirSync(rawDir, { recursive: true });
  const names = ["cover", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5"];
  for (let i = 0; i < names.length; i++) {
    const out = path.join(rawDir, `${names[i]}-source.jpg`);
    const seed = encodeURIComponent(`mh185-travel-${slug}-${i}`);
    const ok = await downloadRetry(`https://picsum.photos/seed/${seed}/1400/900`, out, 3);
    if (!ok || !fs.existsSync(out) || fs.statSync(out).size < 10 * 1024) {
      const query = encodeURIComponent(`${queryFromSlug(slug)},china,travel,landscape`);
      const lock = textSeed(`${slug}-${i}`);
      await downloadRetry(`https://loremflickr.com/1400/900/${query}?lock=${lock}`, out, 1);
    }
  }
  return rawDir;
}

function convert(rawDir, slug) {
  const outDir = path.join(imageRoot, slug);
  const thumbsDir = path.join(thumbRoot, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.rmSync(thumbsDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  const rawFiles = fs.readdirSync(rawDir).filter((name) => name.endsWith(".jpg"));
  if (!rawFiles.length) return;
  for (const file of rawFiles) {
    const input = path.join(rawDir, file);
    try {
      execFileSync("cmd", ["/c", "corepack", "pnpm", "dlx", "sharp-cli", "-i", input, "-o", outDir, "-f", "webp", "-q", "58", "resize", "1400"], { stdio: "ignore" });
      execFileSync("cmd", ["/c", "corepack", "pnpm", "dlx", "sharp-cli", "-i", input, "-o", thumbsDir, "-f", "jpg", "-q", "78", "resize", "780"], { stdio: "ignore" });
    } catch {
      console.warn(`skip broken image ${input}`);
    }
  }
  for (const name of ["cover", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5"]) {
    const webp = path.join(outDir, `${name}-source.webp`);
    const jpg = path.join(thumbsDir, `${name}-source.jpg`);
    if (fs.existsSync(webp)) fs.renameSync(webp, path.join(outDir, `${name}.webp`));
    if (fs.existsSync(jpg)) fs.renameSync(jpg, path.join(thumbsDir, `${name}.jpg`));
  }
}

const dirs = duplicateFallbackDirs();
console.log(`replace duplicate dirs: ${dirs.length}`);
for (const slug of dirs) {
  const rawDir = await downloadSet(slug);
  convert(rawDir, slug);
  console.log(slug);
}
fs.rmSync(rawRoot, { recursive: true, force: true });
