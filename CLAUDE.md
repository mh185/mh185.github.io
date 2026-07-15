# CLAUDE.md

> **新会话先读 [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md)**：项目理解、已做改动、写作/配图/排序/SEO 约定、当前进度、踩过的坑、用户偏好。避免重扫整个项目。

## 项目速览

**玩影指南**（`mh185.github.io`）——一个纯静态推荐站，核心主题是**三份「100」清单**：中国100个必去景点、全球100部必看电影、全球100部必看电视剧。

- **技术栈**：Astro（Basic Blog 主题）+ Tailwind v4 + pnpm，静态构建，部署到 **GitHub Pages**（`.github/workflows` 自动构建）。无后端、无数据库、不收集用户数据（收藏/打卡只存浏览器 localStorage）。
- **内容集合**（`src/content/`）：`travel` / `movies` / `tv` / `legal` / `about`，均用 `baseSchema`（含 `rank` 名次字段，列表与徽章按名次排序）。
- **写作标准**（根目录）：`电影文章写作标准.md`、`旅游文章写作标准.md`、`电视剧文章写作标准.md`；对应清单：`全球100个必看电影.md`、`中国100个必去景点.md`、`全球100个必看电视剧.md`。
- **配图管线**：`scripts/movie-media.mjs`、`scripts/tv-media.mjs`、`scripts/gen-thumbs.mjs`——从 TMDB 取图 → 转 WebP → 生成 `_thumbs` 卡片缩略图（缺缩略图会回退到占位图）。图片放 `public/images/{movies,tv,travel}/<slug>/`。
- **批量补内容**：常用并行子代理，每个 agent 端到端产出一篇（取图→转WebP→验证预告片→写文），主控统一 `pnpm build` + 提交推送。
- **SEO**：文章页有 Review + Movie/TVSeries/TouristAttraction + BreadcrumbList 结构化数据，列表页有 ItemList；sitemap 带 lastmod/priority。

> 注：本项目**不是**交易/行情类应用；如见到价格/K线/订单等约定，属历史模板残留，忽略即可。

---

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
