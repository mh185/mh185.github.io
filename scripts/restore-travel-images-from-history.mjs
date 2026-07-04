import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const tmpRoot = path.join(root, "public/images/_restore-travel-raw");
const imageRoot = path.join(root, "public/images/travel");
const thumbRoot = path.join(root, "public/images/_thumbs/travel");

const mappings = [
  ["huangshan", "huangshan"],
  ["potala-palace-jokhang-temple", "potala-palace"],
  ["terracotta-army", "terracotta-army"],
  ["west-lake-hangzhou", "west-lake"],
  ["lijiang-old-town", "lijiang-old-town"],
  ["qinghai-lake", "qinghai-lake"],
  ["mount-tai", "taishan"],
  ["mount-hua", "huashan"],
  ["mogao-caves-dunhuang", "mogao-caves"],
  ["mingsha-mountain-crescent-spring", "mingsha-mountain-crescent-spring"],
  ["pingyao-ancient-city", "pingyao-ancient-city"],
  ["hongcun-xidi", "xidi-hongcun"],
  ["wuyuan-villages", "wuyuan"],
  ["mount-wuyi", "mount-wuyi"],
  ["suzhou-classical-gardens", "suzhou-classical-gardens"],
  ["mount-emei", "emeishan"],
  ["leshan-giant-buddha", "leshan"],
  ["changbai-mountain-tianchi", "changbai-mountain"],
  ["wuzhen", "wuzhen"],
  ["dujiangyan", "qingcheng-dujiangyan"],
  ["mount-qingcheng", "qingcheng-dujiangyan"],
  ["mount-putuo", "putuo-mountain"],
  ["yungang-grottoes", "yungang-grottoes"],
  ["longmen-grottoes", "longmen-grottoes"],
  ["xishuangbanna-botanical-garden", "xishuangbanna-botanical-garden"],
  ["kanas-lake", "kanas-lake"],
  ["zhangye-danxia", "danxia-mountain"],
  ["chengde-mountain-resort", "chengde-mountain-resort"],
  ["qinhuai-confucius-temple", "qinhuai-confucius-temple"],
  ["shanghai-disney-resort", "shanghai-disney-resort"],
  ["gulangyu-island", "gulangyu"],
  ["wulong-three-natural-bridges", "chongqing"],
  ["chongqing-hongya-cave", "chongqing"],
  ["yalong-bay-sanya", "yalong-bay"],
  ["sanya-nanshan-cultural-tourism-zone", "sanya-nanshan"],
  ["libo-xiaoqikong", "libo-xiaoqikong"],
  ["zhangjiajie-wulingyuan", "zhangjiajie"],
];

function listOldImages(oldDir) {
  const out = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD~1", `public/images/${oldDir}`], { encoding: "utf8" });
  return out.split(/\r?\n/).filter((p) => /\.(jpe?g|png|webp)$/i.test(p));
}

function gitShow(file, out) {
  const data = execFileSync("git", ["show", `HEAD~1:${file}`], { maxBuffer: 50 * 1024 * 1024 });
  fs.writeFileSync(out, data);
}

function convert(rawDir, slug) {
  const outDir = path.join(imageRoot, slug);
  const thumbsDir = path.join(thumbRoot, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.rmSync(thumbsDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  for (const file of fs.readdirSync(rawDir).filter((name) => name.endsWith(".jpg"))) {
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
  const targetNames = ["cover", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5"];
  const firstWebp = targetNames.map((name) => path.join(outDir, `${name}.webp`)).find((file) => fs.existsSync(file));
  const firstJpg = targetNames.map((name) => path.join(thumbsDir, `${name}.jpg`)).find((file) => fs.existsSync(file));
  for (const name of targetNames) {
    const webp = path.join(outDir, `${name}.webp`);
    const jpg = path.join(thumbsDir, `${name}.jpg`);
    if (!fs.existsSync(webp) && firstWebp) fs.copyFileSync(firstWebp, webp);
    if (!fs.existsSync(jpg) && firstJpg) fs.copyFileSync(firstJpg, jpg);
  }
}

for (const [slug, oldDir] of mappings) {
  const rawDir = path.join(tmpRoot, slug);
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.mkdirSync(rawDir, { recursive: true });
  let files = [];
  try {
    files = listOldImages(oldDir);
  } catch {
    continue;
  }
  if (!files.length) continue;
  const chosen = [];
  while (chosen.length < 6) chosen.push(files[chosen.length % files.length]);
  const names = ["cover-source.jpg", "scene-1-source.jpg", "scene-2-source.jpg", "scene-3-source.jpg", "scene-4-source.jpg", "scene-5-source.jpg"];
  chosen.forEach((file, idx) => gitShow(file, path.join(rawDir, names[idx])));
  convert(rawDir, slug);
  console.log(`${slug} <- ${oldDir}`);
}

fs.rmSync(tmpRoot, { recursive: true, force: true });
