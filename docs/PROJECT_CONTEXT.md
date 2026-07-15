# 项目上下文与改动记录（PROJECT_CONTEXT）

> 新会话先读本文，避免重扫整个项目。最后更新：2026-07（会话内维护，改动大时请追加）。

---

## 1. 这是什么项目

**玩影指南**（线上：`https://mh185.github.io`，仓库 `mh185/mh185.github.io`）——一个**纯静态推荐站**。核心主题就一件事：三份「100」清单。

- **中国100个必去景点**（travel，已 100/100）
- **全球100部必看电影**（movies，已 100/100）
- **全球100部必看电视剧**（tv，进行中，见「当前进度」）

站点定位标语（`src/site.config.ts` 的 `description`）："中国100个必去景点、全球100部必看电影、100部必看电视剧，每篇都有深度点评。"

## 2. 技术栈与部署

- **Astro**（Basic Blog 主题，v6.x）+ **Tailwind v4**（`@tailwindcss/vite`）+ **pnpm**（`packageManager: pnpm@10.33.2`，Node 22）。
- 纯静态构建（`pnpm build` → `dist/`）。**无后端、无数据库、不收集用户数据**。
- 部署：**GitHub Pages**，`.github/workflows/*.yml` 自动构建（推 `main` 即触发）。并发组 `pages`、`cancel-in-progress: false`。
- Pages Source 必须是「GitHub Actions」（不是 Deploy from a branch）。
- 集成：`@astrojs/sitemap`（已配 lastmod/priority）、`astro-pagefind`（站内搜索）、`astro-icon`、`astro-expressive-code`、`@astrojs/rss`。

## 3. 内容模型

内容集合在 `src/content/`，配置在 `src/content.config.ts`：

- `travel` / `movies` / `tv` 三个主集合都用 **`baseSchema`**，关键字段：
  - `rank: z.number().optional()` —— **榜单名次**，列表排序和「精选第N名」徽章都靠它。
  - `featured`（enum '1'–'30'，可选）—— 老字段，早期精选用；现在排序统一走 `rank`。
  - `image.src`（本地路径如 `/images/movies/<slug>/poster.webp`）、`tags`、`pubDate`、`license`、`description`、`title`。
  - 影视文章 body 里还有 `video: {platform, embed_id}`（schema 不校验，多余键无害）。
- `legal`（隐私/条款）、`about` 集合另有各自 schema。
- **名次连续性**：三大集合各自 rank 应 1..N 连续、无重复（改完用脚本校验，见下）。

## 4. 目录/关键文件速查

```
根目录/
  电影文章写作标准.md / 旅游文章写作标准.md / 电视剧文章写作标准.md   # 三份写作规范（严格遵守）
  全球100个必看电影.md / 中国100个必去景点.md / 全球100个必看电视剧.md  # 三份清单（名次来源）
  写文章指南.md                                                    # 给用户的AI写作指引
  CLAUDE.md / docs/PROJECT_CONTEXT.md                              # 本文
scripts/
  movie-media.mjs   # node scripts/movie-media.mjs <slug> <posterUrl> <b1>..<b5>  → public/images/movies/<slug>/ + _thumbs
  tv-media.mjs      # 同上，写 public/images/tv/<slug>/
  gen-thumbs.mjs    # 批量给所有电影补 _thumbs 缩略图（旧图补齐用）
src/
  site.config.ts            # 站名/描述/导航(header)/页脚(footer)
  content.config.ts         # 集合 schema（rank 字段在这）
  utils/contentEnhancements.ts  # 排序/评分/结构化数据/专题/相关推荐 —— 核心工具
  utils/images.ts           # cardImageSrc：把 /images/x/poster.webp 映射到 /images/_thumbs/x/poster.jpg
  layouts/BaseLayout.astro  # <head>：meta/OG/Twitter/JSON-LD（支持 jsonLd 附加）
  layouts/PostLayout.astro  # 文章页：面包屑 + 结构化数据 + PostMeta + 正文
  layouts/ListLayout.astro  # 列表页：FilterableGrid（可传 jsonLd）
  pages/index.astro         # 首页：三大清单 hero + 最新 + 专题 + 各栏目 Top
  pages/{movies,travel,tv}/index.astro   # 列表页（按 rank 排 + ItemList 结构化数据）
  pages/{movies,travel,tv}/[id].astro    # 详情页 → PostLayout
  pages/checkin.astro       # 打卡页
  components/content/Card.astro          # 卡片（rankBadge = rank ?? featured）
  components/content/FlagshipCard.astro  # 首页三大清单大卡
  components/content/CheckinButton.astro # 详情页打卡按钮
  components/content/FilterableGrid.astro# 列表页（客户端排序，默认"排名优先"）
```

## 5. 三份写作标准（核心约定）

写任何景点/电影/电视剧文章**必须严格照对应标准**。共同点：

- 字数：普通 ≥1800 字；精选/重点 ≥2500 字（前排名次按精选写）。
- 1 张海报 + **≥4（实际用 5）张剧照**，自托管 WebP + 缩略图。
- ≥1 个**官方预告片**，用响应式 16:9 `video-wrapper` iframe；YouTube 用 oembed 校验可嵌入（`https://www.youtube.com/oembed?url=...&format=json` 返回 **200** 才用）。
- Frontmatter 含 `rank`、`license: cc-by-nc-sa-4-0`、标签、`image.src`、`video`。
- **全部原创**，不复制豆瓣/维基/任何影评，不抄剧情台词。
- **不剧透**关键反转/结局，遇到写"本文不剧透"。
- 电视剧标准额外要求：**分季评价、人物跨季弧光、入坑与追剧指南（含完结状态/观看平台）、更严的跨季剧透纪律**，九段结构。

## 6. 配图管线（务必生成缩略图）

卡片封面用的是 **`_thumbs` 缩略图**（`cardImageSrc` 把 `poster.webp` 映射成 `_thumbs/.../poster.jpg`）。**缺缩略图会回退到长城占位图**——这是踩过的坑。

- 电影：`node scripts/movie-media.mjs <slug> "<poster>" "<b1>" ... "<b5>"`
- 电视剧：`node scripts/tv-media.mjs <slug> "<poster>" "<b1>" ... "<b5>"`
- 两个脚本都会自动生成 `_thumbs`（1600x900 progressive JPEG，`fit:cover, position:attention`）。
- 图源：TMDB（电影 `themoviedb.org/movie/<id>...`，电视剧 `themoviedb.org/tv/<id>...`）的 `image.tmdb.org/t/p/original/*.jpg`。**注意核对 TMDB ID**（子代理多次误命中同名条目）。

## 7. 批量补内容的工作流（重要）

补大量文章时用**并行子代理**（Agent 工具，`general-purpose`）：

1. scratchpad 里有 `movie-agent-guide.md` / `tv-agent-guide.md`（每次会话重新写一份即可），内含完整步骤+模板。
2. 每个 agent 端到端做一部：取 TMDB 图 → 跑 media 脚本 → oembed 验证预告片 → 按标准写 `.md`。**agent 不做 git/build**。
3. 主控收齐后：核对文件+缩略图 → `pnpm build` → 一次性提交推送。
4. 一批 10–20 个并行没问题（并发上限约 10–16，会排队）。

**校验名次连续**（提交前跑）：
```bash
for f in src/content/tv/*.md; do grep -m1 '^rank:' "$f"|sed 's/rank: //'; done | sort -n | uniq -d   # 应为空（无重复）
comm -23 <(seq 1 60) <(for f in src/content/tv/*.md; do grep -m1 '^rank:' "$f"|sed 's/rank: //'; done|sort -n)  # 缺号（应为空）
```

## 8. 排序与徽章逻辑（改过多次，注意别回退）

- **列表页排序**：`FilterableGrid` 有客户端脚本，加载时会按 `data-score` 重排，覆盖服务端顺序。所以 `getEntryScore`（在 `contentEnhancements.ts`）里：**任何带 `rank` 的内容 → 分数 = `1_000_000 - rank`**，纯按名次，不受 featured/boost 干扰。列表默认排序项是「排名优先」。
- **卡片徽章**：`Card.astro` 用 `rankBadge = rank ?? featured` → 显示「精选第N名」，100 部全覆盖。
- **首页**：`byMovieRankAsc`（按 rank）用于「高分电影」等；`FlagshipCard` 显示三大清单进度（`have/total`）。
- travel 的 rank 从标题「第N名」解析后写进了 frontmatter（`getTravelRank` 仍可用）。

## 9. SEO（已做到技术上限）

- `BaseLayout` 支持每页 `jsonLd` 附加。全站有 `WebSite`+`Organization`；文章有 `BlogPosting`。
- 文章页（PostLayout）额外注入：**`Review` + 被评实体（`Movie`/`TVSeries`/`TouristAttraction`，含导演/主创/年份）+ `BreadcrumbList`**，函数在 `contentEnhancements.ts`（`articleStructuredData`）。
- 列表页注入 **`ItemList`**（`itemListStructuredData`）。
- sitemap 带 `lastmod` + 分级 `priority`（首页1.0/列表0.9/文章0.7）。
- 可见面包屑在文章页顶部。
- **收录慢的真正原因不是代码**：站点新 + 无外链 + GSC 里 sitemap 曾「无法抓取」。对策靠用户在 GSC 重提 sitemap、请求收录、攒外链 + 时间。`site:` 数字不准，真实收录看 GSC「网页」报告。

## 10. 站点功能

- **首页 hero**：「100个必去景点 / 100部必看电影 / 100部必看剧」大标题 + 三张 FlagshipCard。
- **打卡页 `/checkin`**：所有文章列成小标签，点击打卡，localStorage 键 `checkinDone`（JSON 数组），带分类进度条。详情页也有 `CheckinButton`（同一个键，联动）。
- **收藏**：`/saved` + 卡片/详情页 `FavoriteButton`，localStorage 键 `savedEntries`。
- **隐私政策** `/legal/privacy-policy`：已改写，强调不收集/不上传/不追踪，只有主题/收藏/打卡三项本地存储。
- 其它：`/topics` 专题、`/rankings` 排行榜、`/tags`、`/tools`、`/plans`、`/links`、pagefind 搜索、RSS。

## 11. 当前进度

- **电影 movies：100 / 100 ✅**（rank 1–100 齐全）
- **旅游 travel：100 / 100 ✅**（rank 1–100，标题「第N名」+ frontmatter rank）
- **电视剧 tv：60 / 100**（rank 1–60 已完成；**待补 61–100**）
  - 61–75 华语经典（红楼梦87版、西游记86版、大明王朝1566、走向共和、琅琊榜、甄嬛传、漫长的季节、亮剑、武林外传、潜伏、我的团长我的团、士兵突击、想见你、战长沙、山海情）——**注意华语老剧 TMDB 素材可能少，需放宽找图**。
  - 76–90 日韩亚洲（请回答1988、信号、秘密森林、黑暗荣耀、鬼怪…）
  - 91–100 迷你剧（兄弟连、切尔诺贝利、太平洋战争、后翼弃兵、正常人、白莲花度假村、怒呛人生、宿敌、空皇冠、无神）——注意：`chernobyl`、`the-queens-gambit` 等 slug 被 `contentEnhancements.ts` 专题引用。

## 12. 踩过的坑 / 注意事项

- **部署排队**：GitHub Actions 有时把 deploy 卡在 `queued` 几分钟到十几分钟（等 runner），不是失败，会自动跑完。查状态：`curl -s "https://api.github.com/repos/mh185/mh185.github.io/actions/runs?per_page=3"`。
- **缩略图**：新增文章务必确保 `_thumbs` 存在，否则卡片回退占位图。
- **dev server**：`pnpm dev --host`（不加 --host 会 IPv6-only 打不开）。
- **内容集合增删**需重启 dev server 才生效。
- **推送冲突**：远端偶有他方/linter 提交，push 被拒时 `git pull --rebase origin main` 再推。
- **TMDB ID 核对**：搜索易命中同名条目，务必核对片名/年份/主创。
- **预告片**：只用官方/发行方且 oembed 返回 200 的；避开非官方转载、含结局剧透的。

## 13. 约定

- **Git 提交身份**：`git -c user.name="mh185" -c user.email="mh@valotrade.ai" commit ...`，消息末尾带 `Co-Authored-By: Claude ...`。
- **用户偏好**（重要）：
  - 别问 yes/no，默认 yes 直接做（自主推进，分批构建提交推送）。
  - 普通文章配图即可；精选文章要配外链视频。
  - 图片要**真实、天气好、地点对**（旅游图 GPS 核对过位置）。
- 简体中文交流。
