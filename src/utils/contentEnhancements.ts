import type { CollectionEntry } from "astro:content";

type MainCollection = "travel" | "movies" | "tv";
type Entry = CollectionEntry<MainCollection>;

export const collectionLabels: Record<MainCollection, string> = {
    travel: "旅游",
    movies: "电影",
    tv: "电视剧",
};

export const collectionLinks: Record<MainCollection, string> = {
    travel: "/travel",
    movies: "/movies",
    tv: "/tv",
};

const scoreBoosts: Record<string, number> = {
    "travel/zhangjiajie": 99,
    "travel/chongqing-hotspots": 96,
    "travel/jiuzhaigou-valley": 95,
    "travel/huangshan-scenic-area": 94,
    "travel/forbidden-city-palace-museum": 93,
    "travel/west-lake-hangzhou": 92,
    "travel/guilin-yangshuo": 91,
    "travel/mogao-caves": 90,
    "travel/terracotta-army": 89,
    "travel/potala-palace": 88,
    "movies/shawshank-redemption": 99,
    "movies/inception": 98,
    "movies/interstellar": 97,
    "movies/the-dark-knight": 96,
    "movies/the-godfather": 95,
    "movies/titanic": 94,
    "movies/the-matrix": 93,
    "movies/lotr-return-of-the-king": 92,
    "movies/parasite": 91,
    "movies/oppenheimer": 90,
    "tv/breaking-bad": 99,
    "tv/game-of-thrones": 98,
    "tv/chernobyl": 97,
    "tv/better-call-saul": 96,
    "tv/three-body": 95,
    "tv/black-mirror": 94,
    "tv/the-wire": 93,
    "tv/the-last-of-us": 92,
    "tv/severance": 91,
    "tv/stranger-things": 90,
};

export function entryUrl(entry: Entry) {
    return `/${entry.collection}/${entry.id}`;
}

export function getTravelRank(entry: Entry) {
    if (entry.collection !== "travel") return undefined;
    const haystacks = [entry.data.title, ...entry.data.tags];
    for (const text of haystacks) {
        const match = text.match(/第(\d+)名/);
        if (match) return Number.parseInt(match[1], 10);
    }
    return undefined;
}

export function tagSlug(tag: string) {
    return `t-${[...tag]
        .map((char) => char.codePointAt(0)?.toString(36) ?? "")
        .join("-")}`;
}

export function getEntryScore(entry: Entry) {
    // 带榜单名次的内容(电影/旅游)完全按名次排序，名次越小分越高，不受 featured/boost 干扰
    if (typeof entry.data.rank === "number") {
        return 1_000_000 - entry.data.rank;
    }
    const key = `${entry.collection}/${entry.id}`;
    const travelRank = getTravelRank(entry);
    const rankScore = travelRank ? 1000 - travelRank : 0;
    const featured = typeof entry.data.featured === "number" ? 120 - entry.data.featured : 0;
    const boost = scoreBoosts[key] ?? 0;
    const tagScore = entry.data.tags.length;
    const recency = Math.floor(entry.data.pubDate.valueOf() / 1000000000);
    return rankScore * 1000 + featured * 1000 + boost * 10 + tagScore + recency / 1000;
}

// 电影专用：直接按榜单名次升序（无名次排最后）
export function byMovieRankAsc(a: Entry, b: Entry) {
    const ra = typeof a.data.rank === "number" ? a.data.rank : 9999;
    const rb = typeof b.data.rank === "number" ? b.data.rank : 9999;
    return ra - rb;
}

export function byScoreDesc(a: Entry, b: Entry) {
    return getEntryScore(b) - getEntryScore(a);
}

export function byTravelRankAsc(a: Entry, b: Entry) {
    return (getTravelRank(a) ?? 9999) - (getTravelRank(b) ?? 9999);
}

export const topicGroups = [
    {
        id: "china-5a",
        title: "中国热门 5A 景区",
        description: "把山岳、古建、石窟、湖泊和主题乐园放在一起看, 适合做第一次国内旅行清单。",
        collection: "travel" as const,
        tags: ["5A景区", "热门景点", "旅行攻略", "世界遗产"],
        ids: [
            "zhangjiajie",
            "jiuzhaigou-valley",
            "huangshan-scenic-area",
            "forbidden-city-palace-museum",
            "mogao-caves",
            "terracotta-army",
            "potala-palace",
            "west-lake-hangzhou",
            "guilin-yangshuo",
            "huanglong-scenic-area",
            "taishan",
            "huashan",
        ],
    },
    {
        id: "weekend-travel",
        title: "周末短途和城市休闲",
        description: "更适合两三天出发的轻旅行, 兼顾交通便利、夜景、古镇、园林和城市体验。",
        collection: "travel" as const,
        tags: ["城市旅行", "古城旅行", "古镇", "海岛旅行"],
        ids: [
            "chongqing-hotspots",
            "west-lake-hangzhou",
            "suzhou-classical-gardens",
            "wuzhen",
            "xidi-hongcun",
            "gulangyu",
            "qinhuai-confucius-temple",
            "oriental-pearl-tower",
            "dapeng-coast",
            "lijiang-old-town",
        ],
    },
    {
        id: "classic-movies",
        title: "一生必看的高分电影",
        description: "从剧情片、犯罪片、科幻片到史诗片, 适合作为补片路线的核心清单。",
        collection: "movies" as const,
        tags: ["高分电影", "经典电影", "口碑电影"],
        ids: [
            "shawshank-redemption",
            "the-godfather",
            "the-dark-knight",
            "inception",
            "interstellar",
            "the-matrix",
            "lotr-return-of-the-king",
            "parasite",
            "12-angry-men",
            "schindlers-list",
            "pulp-fiction",
            "fight-club",
        ],
    },
    {
        id: "animation-family",
        title: "动画电影和家庭观影",
        description: "适合周末、亲子和轻松补片, 但主题并不幼稚, 很多片子后劲很足。",
        collection: "movies" as const,
        tags: ["动画电影", "动画爱情", "家庭观影"],
        ids: [
            "spirited-away",
            "coco",
            "wall-e",
            "toy-story",
            "up",
            "the-lion-king",
            "your-name",
            "weathering-with-you",
            "inside-out-2",
            "ne-zha-2",
        ],
    },
    {
        id: "binge-tv",
        title: "假期值得刷的高分剧",
        description: "口碑稳定、人物线足够厚, 适合集中几天沉浸式追完或慢慢补。",
        collection: "tv" as const,
        tags: ["高分美剧", "热门电视剧", "口碑剧集"],
        ids: [
            "breaking-bad",
            "better-call-saul",
            "chernobyl",
            "the-wire",
            "game-of-thrones",
            "black-mirror",
            "the-last-of-us",
            "severance",
            "stranger-things",
            "succession",
            "the-queens-gambit",
            "arcane",
        ],
    },
    {
        id: "sci-fi-suspense",
        title: "科幻悬疑和烧脑剧集",
        description: "适合喜欢设定、谜题、时间线和世界观的人, 看完很适合回头复盘。",
        collection: "tv" as const,
        tags: ["科幻剧", "悬疑剧", "科技寓言"],
        ids: [
            "black-mirror",
            "dark",
            "severance",
            "westworld",
            "three-body",
            "the-x-files",
            "doctor-who",
            "sherlock",
            "mindhunter",
            "true-detective",
        ],
    },
];

export function getTopicEntries(entries: Entry[], topicId: string) {
    const topic = topicGroups.find((item) => item.id === topicId);
    if (!topic) return [];
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    const byTags = entries
        .filter((entry) => entry.collection === topic.collection)
        .filter((entry) => topic.tags.some((tag) => entry.data.tags.includes(tag)))
        .sort(byScoreDesc);
    const picked = [
        ...topic.ids.map((id) => byId.get(id)).filter(Boolean),
        ...byTags,
    ] as Entry[];
    return [...new Map(picked.map((entry) => [entry.id, entry])).values()];
}

export function getRelatedEntries(entry: Entry, entries: Entry[], limit = 6) {
    const tagSet = new Set(entry.data.tags);
    return entries
        .filter((item) => item.collection === entry.collection && item.id !== entry.id)
        .map((item) => ({
            item,
            score:
                item.data.tags.filter((tag) => tagSet.has(tag)).length * 100 +
                getEntryScore(item),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ item }) => item);
}

export function getInfoItems(entry: Entry) {
    const tags = entry.data.tags;
    if (entry.collection === "travel") {
        const title = entry.data.title.split(/[ :：]/)[0].replace(/[《》]/g, "");
        const season = tags.some((tag) => tag.includes("海") || tag.includes("湖"))
            ? "春秋舒适, 夏季注意防晒和人流"
            : tags.some((tag) => tag.includes("山") || tag.includes("登山"))
              ? "春秋优先, 冬季看天气和路况"
              : "春秋最稳, 节假日建议提前预约";
        return [
            ["适合人群", tags.includes("亲子旅行") ? "亲子、轻松游" : "第一次打卡、摄影、深度游"],
            ["推荐时长", tags.some((tag) => tag.includes("山") || tag.includes("古城")) ? "1-2 天" : "半天-1 天"],
            ["最佳季节", season],
            ["路线重点", `${title}核心景观 + 低峰时段慢游`],
            ["避坑提醒", "提前查预约、天气和交通换乘, 不要只按打卡点赶路"],
        ];
    }
    if (entry.collection === "movies") {
        return [
            ["适合谁看", tags.includes("动画电影") ? "亲子、动画爱好者、周末放松" : "想补高分片和经典类型片的人"],
            ["观看场景", tags.some((tag) => tag.includes("悬疑") || tag.includes("科幻")) ? "适合安静完整观看" : "适合周末集中观看"],
            ["关键词", tags.slice(0, 3).join(" / ")],
            ["推荐理由", entry.data.featured ? "精选片单入口, 适合作为补片第一站" : "口碑稳定, 适合按类型继续扩展"],
            ["相似方向", "可继续看同标签下的电影推荐"],
        ];
    }
    return [
        ["适合谁看", tags.some((tag) => tag.includes("喜剧")) ? "想轻松追剧和下饭的人" : "喜欢长线人物和连续叙事的人"],
        ["观看节奏", tags.some((tag) => tag.includes("悬疑") || tag.includes("科幻")) ? "建议别倍速, 细节很重要" : "可按季慢慢追"],
        ["关键词", tags.slice(0, 3).join(" / ")],
        ["推荐理由", entry.data.featured ? "精选剧集入口, 适合假期集中刷" : "类型明确, 适合按兴趣补剧"],
        ["追剧提醒", "先看前两集确认节奏, 再决定是否连续追"],
    ];
}
