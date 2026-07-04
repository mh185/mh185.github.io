import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const listPath = path.join(root, "中国100个必去景点.md");
const travelDir = path.join(root, "src/content/travel");
const imageRoot = path.join(root, "public/images/travel");
const thumbRoot = path.join(root, "public/images/_thumbs/travel");
const rawRoot = path.join(root, "public/images/_raw-travel");

const existingByName = new Map([
  ["万里长城", "great-wall"],
  ["故宫（北京）", "forbidden-city"],
  ["桂林漓江", "guilin-li-river"],
  ["九寨沟", "jiuzhaigou-valley"],
  ["张家界武陵源（含国家森林公园）", "zhangjiajie-wulingyuan"],
]);

const slugMap = {
  "黄山": "huangshan",
  "布达拉宫和大昭寺（拉萨）": "potala-palace-jokhang-temple",
  "秦始皇兵马俑（西安）": "terracotta-army",
  "西湖（杭州）": "west-lake-hangzhou",
  "长江三峡": "yangtze-three-gorges",
  "丽江古城": "lijiang-old-town",
  "大理洱海": "dali-erhai-lake",
  "稻城亚丁": "daochen-yading",
  "黄果树瀑布": "huangguoshu-waterfall",
  "青海湖": "qinghai-lake",
  "茶卡盐湖": "chaka-salt-lake",
  "呼伦贝尔大草原": "hulunbuir-grassland",
  "泰山": "mount-tai",
  "华山": "mount-hua",
  "嵩山少林寺": "songshan-shaolin-temple",
  "莫高窟（敦煌）": "mogao-caves-dunhuang",
  "鸣沙山月牙泉": "mingsha-mountain-crescent-spring",
  "平遥古城": "pingyao-ancient-city",
  "安徽宏村/西递": "hongcun-xidi",
  "婺源徽派乡村": "wuyuan-villages",
  "武夷山": "mount-wuyi",
  "苏州园林（拙政园等）": "suzhou-classical-gardens",
  "峨眉山": "mount-emei",
  "乐山大佛": "leshan-giant-buddha",
  "长白山天池": "changbai-mountain-tianchi",
  "乌镇": "wuzhen",
  "周庄": "zhouzhuang",
  "西塘": "xitang",
  "凤凰古城": "fenghuang-ancient-town",
  "成都大熊猫繁育研究基地": "chengdu-panda-base",
  "神农架": "shennongjia",
  "恩施大峡谷": "enshi-grand-canyon",
  "都江堰": "dujiangyan",
  "青城山": "mount-qingcheng",
  "九华山": "mount-jiuhua",
  "普陀山": "mount-putuo",
  "五台山": "mount-wutai",
  "云冈石窟": "yungang-grottoes",
  "龙门石窟": "longmen-grottoes",
  "香格里拉（独克宗/普达措）": "shangri-la-dukezong-pudacuo",
  "泸沽湖": "lugu-lake",
  "梅里雪山": "meili-snow-mountain",
  "西双版纳热带植物园": "xishuangbanna-botanical-garden",
  "红河哈尼梯田（元阳梯田）": "yuanyang-hani-rice-terraces",
  "三星堆博物馆": "sanxingdui-museum",
  "喀纳斯湖": "kanas-lake",
  "赛里木湖": "sayram-lake",
  "天山天池": "tianchi-lake-tianshan",
  "独库公路": "duku-highway",
  "张掖七彩丹霞": "zhangye-danxia",
  "嘉峪关关城": "jiayuguan-fort",
  "敦煌雅丹魔鬼城": "dunhuang-yadan",
  "承德避暑山庄": "chengde-mountain-resort",
  "哈尔滨冰雪大世界": "harbin-ice-snow-world",
  "千岛湖（杭州）": "qiandao-lake",
  "太湖": "taihu-lake",
  "瘦西湖（扬州）": "slender-west-lake-yangzhou",
  "南京夫子庙-秦淮风光带": "qinhuai-confucius-temple",
  "中山陵": "sun-yat-sen-mausoleum",
  "上海外滩及陆家嘴夜景": "shanghai-bund-lujiazui",
  "上海迪士尼乐园": "shanghai-disney-resort",
  "青岛栈桥及八大关": "qingdao-zhanqiao-badaguan",
  "崂山": "mount-lao",
  "厦门鼓浪屿": "gulangyu-island",
  "北戴河-山海关": "beidaihe-shanhaiguan",
  "厦门大学": "xiamen-university",
  "福建土楼": "fujian-tulou",
  "腾冲火山热海": "tengchong-volcano-hot-sea",
  "阿尔山国家森林公园": "arxan-national-forest-park",
  "额济纳胡杨林": "ejina-populus-euphratica",
  "重庆武隆天生三桥": "wulong-three-natural-bridges",
  "重庆洪崖洞": "chongqing-hongya-cave",
  "三峡大坝": "three-gorges-dam",
  "江西庐山": "mount-lu",
  "江西三清山": "mount-sanqing",
  "广州塔": "canton-tower",
  "珠海长隆海洋王国": "chimelong-ocean-kingdom",
  "深圳湾公园": "shenzhen-bay-park",
  "广州长隆野生动物世界": "chimelong-safari-park",
  "开平碉楼": "kaiping-diaolou",
  "澳门历史城区": "historic-centre-of-macau",
  "香港维多利亚港": "victoria-harbour-hong-kong",
  "香港迪士尼乐园": "hong-kong-disneyland",
  "北海银滩": "beihai-silver-beach",
  "涠洲岛": "weizhou-island",
  "三亚亚龙湾": "yalong-bay-sanya",
  "蜈支洲岛": "wuzhizhou-island",
  "南山文化旅游区（三亚）": "sanya-nanshan-cultural-tourism-zone",
  "桂林阳朔西街": "yangshuo-west-street",
  "德天跨国瀑布": "detian-waterfall",
  "北海老街": "beihai-old-street",
  "西藏纳木错": "namtso-lake",
  "西藏林芝雅鲁藏布大峡谷": "yarlung-tsangpo-grand-canyon",
  "贵州荔波小七孔": "libo-xiaoqikong",
  "贵州西江千户苗寨": "xijiang-qianhu-miao-village",
};

const regionMap = [
  [/黄山|宏村|西递/, "安徽"],
  [/布达拉|大昭寺|纳木错|雅鲁藏布|林芝/, "西藏"],
  [/兵马俑|华山/, "陕西"],
  [/西湖|千岛湖|乌镇|西塘|杭州/, "浙江"],
  [/长江三峡|三峡大坝|武隆|洪崖洞/, "重庆"],
  [/丽江|大理|洱海|香格里拉|泸沽湖|梅里|腾冲/, "云南"],
  [/稻城|峨眉|乐山|都江堰|青城|成都|九寨/, "四川"],
  [/黄果树|荔波|西江/, "贵州"],
  [/青海湖|茶卡/, "青海"],
  [/呼伦贝尔|阿尔山|额济纳/, "内蒙古"],
  [/泰山|青岛|崂山/, "山东"],
  [/少林|嵩山/, "河南"],
  [/敦煌|莫高|鸣沙|嘉峪关|张掖/, "甘肃"],
  [/平遥|五台|云冈/, "山西"],
  [/婺源|庐山|三清山/, "江西"],
  [/武夷|厦门|鼓浪屿|福建土楼/, "福建"],
  [/苏州|夫子庙|秦淮|中山陵|瘦西湖|太湖|周庄/, "江苏"],
  [/长白|哈尔滨/, "东北"],
  [/凤凰|张家界|长沙|长隆|广州|深圳|珠海|开平/, "华南"],
  [/喀纳斯|赛里木|天山|独库/, "新疆"],
  [/上海|外滩|陆家嘴|迪士尼/, "上海"],
  [/澳门/, "澳门"],
  [/香港|维多利亚/, "香港"],
  [/北海|涠洲|德天/, "广西"],
  [/三亚|亚龙湾|蜈支洲|南山/, "海南"],
];

function regionOf(name) {
  return regionMap.find(([re]) => re.test(name))?.[1] ?? "中国";
}

function typeOf(name) {
  if (/故宫|宫|寺|石窟|窟|博物馆|古城|园林|陵|关|碉楼|土楼|历史|夫子庙|大昭寺|少林|三星堆|澳门/.test(name)) return "human";
  if (/湖|海|湾|岛|银滩|港|大坝|瀑布|泉|峡|山|峰|丹霞|森林|草原|梯田|胡杨|天池|公路/.test(name)) return "nature";
  if (/迪士尼|长隆|冰雪|广州塔|外滩|陆家嘴|洪崖洞|大学|公园|西街/.test(name)) return "urban";
  return "mixed";
}

const typeLabel = {
  human: "古建人文",
  nature: "自然风光",
  urban: "都市休闲",
  mixed: "综合旅行",
};

function cleanTitle(name) {
  return name.replace(/[（）()]/g, "").replace(/\s+/g, "");
}

function queryName(name) {
  return cleanTitle(name)
    .replace("（含国家森林公园）", "")
    .replace("（拙政园等）", "")
    .replace("（杭州）", "")
    .replace("（三亚）", "")
    .replace("（拉萨）", "")
    .replace("（西安）", "")
    .replace("（敦煌）", "")
    .replace("（独克宗/普达措）", "")
    .replace("安徽", "")
    .replace("江西", "")
    .replace("贵州", "")
    .replace("西藏", "");
}

function parseList() {
  const raw = fs.readFileSync(listPath, "utf8");
  return raw.split(/\r?\n/)
    .map((line) => line.match(/^(\d+)\.\s*(.+?)\s*$/))
    .filter(Boolean)
    .map((m) => ({ rank: Number(m[1]), name: m[2] }));
}

function article(name, rank, slug) {
  const region = regionOf(name);
  const kind = typeOf(name);
  const label = typeLabel[kind];
  const simple = cleanTitle(name);
  const isNature = kind === "nature";
  const isHuman = kind === "human";
  const bestSeason = isNature ? "春秋两季通常更稳，夏季看水量和绿意，冬季则要重点关注道路、低温和部分项目开放情况" : "春秋两季体感更舒适，寒暑假和节假日人流更集中，冬季适合避开大客流但要注意开放时间变化";
  const introFocus = isNature
    ? `${simple}的价值不只在“景色好看”，而在它把地形、水系、光线和旅行节奏组合成一套完整体验。`
    : `${simple}的价值不只在“名气大”，而在它把历史现场、空间秩序和真实游览决策放在同一条路线上。`;
  const routeA = isNature ? "高效看景线" : "经典理解线";
  const routeB = isNature ? "慢游摄影线" : "深度人文线";
  const photo = isNature ? "远景层次、日出日落、倒影和局部纹理" : "建筑轴线、门洞框景、细部构件和人流退去后的空间感";

  return `---
draft: false
featured: '${rank <= 30 ? String(rank) : "none"}'
title: 中国必去景点第${rank}名:${simple}深度攻略,第一次去怎么走才不踩坑
description: ${simple}深度图文攻略,覆盖核心看点、推荐路线、交通接驳、住宿区域、预算区间、摄影机位、季节选择和真实避坑,适合第一次去${region}旅行前收藏使用。
pubDate: 2026-07-05
license: cc-by-nc-sa-4-0
tags:
  - 中国必去景点第${rank}名
  - ${simple}
  - ${region}
  - ${label}
  - 深度旅游攻略
  - 避坑攻略
image:
  src: /images/travel/${slug}/cover.webp
  alt: ${simple}核心景观高清实景图
---

${simple}能进入中国必去景点第${rank}名，不是因为它适合被匆匆打卡，而是因为它确实能提供一种难以替代的旅行经验。${introFocus}第一次去这里，最需要避免的错误是只收藏几个热门机位，却没有想清楚交通怎么接、时间怎么分、哪些项目值得保留、哪些地方可以放弃。这样走到现场时，很容易被排队、天气、换乘和体力打乱节奏。

这篇攻略按“能直接照着规划行程”的标准来写：先说为什么值得去，再拆核心看点，然后给出不同人群可执行的路线时间轴，最后把交通、住宿、预算、摄影和避坑说清楚。文中不写容易过期的固定票价，所有门票、开放、预约和交通班次都建议出发前以官方渠道为准；但路线逻辑、体力判断和取舍方法，可以作为你制定行程的底稿。

![${simple}的代表性景观,适合先建立目的地整体印象](/images/travel/${slug}/scene-1.webp)

*图说: 第一次看${simple},不要急着追网红同款,先建立对景区尺度、入口和核心景观关系的整体判断。*

## 为什么${simple}值得专程去

${simple}最值得看的地方，不是单一景点名称，而是它背后的空间关系。${isNature ? `自然型目的地的体验高度依赖季节、天气和动线，上午和下午看到的色彩、阴影、水量或云雾都可能完全不同。` : `人文型目的地的体验高度依赖你是否理解入口、轴线、建筑层级和展陈顺序，否则很容易把它逛成一组相似建筑或展柜。`}如果你只给它两三个小时，能看到最有名的部分；如果愿意按一整天或两天规划，它会呈现出更完整的层次。

它最适合三类人：第一类是第一次到${region}旅行、希望用一个代表性景点建立区域印象的人；第二类是愿意慢慢看细节、需要靠谱路线减少决策成本的人；第三类是摄影或亲子出行，希望知道什么时候去、站在哪里看、哪些路段不适合硬走的人。相反，如果你只想短时间打卡很多城市，${simple}不适合被塞进过密行程，它需要基本的停留时间。

![${simple}的景观层次需要结合时间和路线慢慢展开](/images/travel/${slug}/scene-2.webp)

*图说: 好的游览节奏不是一路赶,而是把体力留给最有代表性的区域。*

## 核心看点1:主景观区,先看目的地的“骨架”

第一次到${simple},主景观区一定要先看。这里通常承载了目的地最强的辨识度，也是理解后续支线的基础。游览时建议先远看整体，再近看细节；先弄清楚入口、出口、换乘点和核心观景区的位置，再决定是否深入支线。很多游客一开始就在入口拍太久，结果真正精彩的路段反而只能匆匆经过。

最佳观察时间通常是上午入园后前两小时。这个时间人流还没有完全堆积，光线也更容易保留层次。${isNature ? `如果遇到阴天，不要急着失望，自然景观在云雾、雨后和低角度光线下往往更有质感。` : `如果人流密集，不要硬挤正面机位，侧面角度、门洞和转角通常更容易看出空间关系。`}主景观区适合留出不少于90分钟，少于这个时间，很容易只剩照片，没有真正的现场记忆。

## 核心看点2:支线区域,决定这趟旅行是否有深度

支线区域常常不是宣传图里最显眼的部分，却最能拉开体验差距。${isNature ? `它可能是一段步道、一个视野更安静的观景点、一个更适合看倒影或日落的位置。` : `它可能是一处侧院、展馆、街巷、老建筑群或更安静的陈列空间。`}如果只走主线，${simple}会显得“看过了”；如果给支线留时间，它才会从一个景点变成一段完整旅行。

支线不要贪多。第一次来建议选一条最匹配你兴趣的支线：亲子家庭选距离短、补给方便的；摄影爱好者选光线和视角更好的；老人同行则选台阶少、回撤容易的。不要看到地图上每个点都想去，景区里的“看起来不远”，到了现场往往会被排队、台阶、天气和换乘放大。

![${simple}的支线区域常常能提供比主入口更安静的观察角度](/images/travel/${slug}/scene-3.webp)

*图说: 支线不一定更热门,但经常更适合慢看细节和避开人群。*

## 核心看点3:季节与天气,体验差距会非常明显

${bestSeason}。做攻略时不要只问“几月最好”，还要问“我想看什么”。想看清晰远景，就优先选择能见度好的季节；想拍氛围，就要接受云雾和降雨的不确定；想带老人孩子舒服走完，就应避开极端高温、严寒和大客流假期。

如果只来一次，建议优先选择工作日或节假日前后的错峰日期。节假日不是不能去，而是要改变玩法：早到、少走回头路、提前确认交通和住宿、不要在热门点正午硬挤。天气变化时要有备用路线，${isNature ? `大雨或大雾时优先走低处、短线和补给方便的区域。` : `人流过大或临时闭馆时,优先保留主线,支线根据现场情况取舍。`}

## 推荐路线A:${routeA},适合第一次来

适合人群: 第一次到${simple}、时间有限、想稳稳看完代表性景观的人。

建议时长: 半天到1天,不要再强塞距离很远的景点。

时间轴:

- 07:30 到 08:30: 从住宿地出发,优先选择官方交通、地铁/公交接驳、正规景区直通车或提前确认好的包车。不要只看地图直线距离。
- 08:30 到 09:00: 到达入口或游客中心,先处理洗手间、补水、寄存和门票核验。旺季要把排队时间算进去。
- 09:00 到 11:00: 先走主景观区。这个阶段体力最好,也最适合建立对${simple}的整体印象。
- 11:00 到 12:00: 选择一个代表性支线或观景点,不要在每个小点都停留。
- 12:00 到 13:30: 午餐和休整。景区内餐饮通常以补给为主,想吃得舒服可以把正餐放到景区外。
- 13:30 到 15:30: 根据体力补一个低强度区域,或回到主景观区换角度看。带老人孩子时建议此时开始回撤。
- 15:30 后: 出景区或转入附近轻量景点。不要把返程交通卡得太死。

取舍建议: 第一次来,主景观区一定保留;商业化很重、距离较远、需要反复排队的项目可以放弃。旅行的成功标准不是地图全打勾,而是核心体验完整。

![${simple}的一日路线应优先保证主景观区和一条支线](/images/travel/${slug}/scene-4.webp)

*图说: 第一次来最怕贪多,主线走稳比到处补点更重要。*

## 推荐路线B:${routeB},适合深度游和摄影

适合人群: 摄影爱好者、二刷游客、愿意住一晚并等光线的人。

建议时长: 2天1晚或更久。

时间轴:

- D1 上午: 抵达${simple},先完成住宿、寄存和交通确认。不要拖着大行李进景区。
- D1 下午: 走主景观区和最容易到达的支线,重点踩点,观察第二天清晨或傍晚适合拍摄的位置。
- D1 傍晚: 留给${photo}。这个时段比正午更容易出层次。
- D2 清晨: 早起看低人流状态下的核心区域。摄影党可以重点拍远景、局部和环境人像。
- D2 上午: 补走一条昨天没来得及看的支线,但不要把返程前最后两小时安排得太满。
- D2 中午后: 返程或转入下一个目的地。

取舍建议: 深度游的关键是“住近一点、早一点、慢一点”。如果住宿离入口太远,清晨和傍晚的优势会被交通吃掉。

## 深度游玩实操攻略

### 交通接驳

到${simple}之前,先确认三件事:大交通到哪个城市或车站,从车站到景区入口怎么接,景区内部是否需要环保车、游船、索道或摆渡车。很多失败行程不是景区不好,而是把接驳想得太简单。第一次来建议优先官方渠道和正规交通,不要在车站出口临时接受不明包车。

### 体力消耗

即使${simple}看起来不是高强度户外,一整天走下来也会很累。普通游客建议把连续步行控制在2到3小时内,中间安排明确休息点。带老人、儿童或膝盖不适者,宁可使用景区交通工具,也不要把体力浪费在重复上坡、排队和折返上。

### 现场取舍

如果时间不够,保留主景观区、一个高价值支线和一个舒适休息点。放弃距离远、商业化强、排队时间不可控的项目。真正好的攻略不是让你“全部看完”,而是帮你知道在现场不顺时该删掉什么。

## 摄影与打卡建议

${simple}拍摄不要只追热门同款。建议先找三个角度:一个全景角度,一个中景角度,一个局部细节。全景负责交代环境,中景负责表现层次,局部细节负责让照片有记忆点。上午适合拍清晰结构,傍晚适合拍层次和氛围,正午则更适合休息或转场。

器材上,手机足够记录旅行;如果使用相机,中焦段最实用。${isNature ? `自然景观可以带中长焦压缩远处层次,也可以用广角表现空间。` : `人文景观可以多用35mm到70mm焦段,避免过度广角导致建筑变形。`}安全红线很明确:不要翻护栏,不要进入未开放区域,不要为了避人群站到危险边缘。

![${simple}的摄影重点是光线、角度和安全边界](/images/travel/${slug}/scene-5.webp)

*图说: 好照片来自合适时间和稳定路线,不是靠冒险越界。*

## 住宿、预算和避坑

住宿优先看交通,其次看舒适度。只玩一天可以住在交通枢纽或市区换乘方便区域;想拍清晨和傍晚,就住到景区入口或核心区域附近。不要只看“距离景点几公里”,要看是否有可靠接驳、是否方便晚餐、是否能寄存行李。

预算可以分三档。低预算玩法以公共交通、基础住宿和核心路线为主;舒适玩法增加正规接驳、景区交通和位置更好的住宿;深度玩法则把预算放在多住一晚、清晨/傍晚交通和更充裕的时间上。门票和景区交通价格会变化,出发前以官方公布为准。

真实避坑:

1. 不要把${simple}塞进过密行程。它至少需要半天到一天,深度体验最好留一晚。
2. 不要在车站或景区门口临时相信低价包车和低价一日游,先看清是否购物、是否绕路、是否走正规入口。
3. 不要低估节假日排队。热门日期尽量早到,中午前完成核心区域。
4. 不要只看社交平台最火机位。很多同款点人多、等待久,实际体验不一定最好。
5. 不要忽视天气和体力。${isNature ? `自然景观受天气影响明显,要准备雨具、防滑鞋和备用短线。` : `人文景区受开放时间、预约和临时管控影响明显,要提前确认公告。`}

## 结语

${simple}值得去,但它不适合被粗暴打卡。第一次来,请先把交通和主线安排稳,再根据体力选择支线;想拍照,就给清晨或傍晚留时间;带老人孩子,就把少折返、少排队、少硬走放在第一位。真正好的旅行不是看完所有点,而是离开时能清楚记得:这里为什么重要,哪里最好看,下次如果再来,自己会怎样走得更从容。`;
}

async function commonsImages(name, limit = 6) {
  const q = encodeURIComponent(`${queryName(name)} China`);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|mime&iiurlwidth=1400&format=json&origin=*`;
  const res = await fetch(url, { headers: { "user-agent": "mh185-travel-content-generator/1.0" } });
  if (!res.ok) throw new Error(`Commons search failed ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  const urls = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    const fileUrl = info?.thumburl || info?.url;
    if (!fileUrl) continue;
    if (/\.pdf|\.svg|\.djvu|map|logo|icon|diagram|seal/i.test(page.title || "")) continue;
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(fileUrl)) continue;
    if (/\.pdf|logo|map|icon|diagram|seal|svg/i.test(fileUrl)) continue;
    urls.push(fileUrl);
    if (urls.length >= limit) break;
  }
  return urls;
}

async function download(url, out) {
  const res = await fetch(url, { headers: { "user-agent": "mh185-travel-content-generator/1.0" } });
  if (!res.ok) throw new Error(`download failed ${res.status} ${url}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(out, Buffer.from(ab));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function convert(rawDir, outDir, thumbsDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  execFileSync("corepack", ["pnpm", "dlx", "sharp-cli", "-i", path.join(rawDir, "*.jpg"), "-o", outDir, "-f", "webp", "-q", "58", "resize", "1400"], { stdio: "ignore" });
  execFileSync("corepack", ["pnpm", "dlx", "sharp-cli", "-i", path.join(rawDir, "*.jpg"), "-o", thumbsDir, "-f", "jpg", "-q", "78", "resize", "780"], { stdio: "ignore" });
  const names = ["cover", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5"];
  for (const name of names) {
    const sourceWebp = path.join(outDir, `${name}-source.webp`);
    const sourceJpg = path.join(thumbsDir, `${name}-source.jpg`);
    if (fs.existsSync(sourceWebp)) fs.renameSync(sourceWebp, path.join(outDir, `${name}.webp`));
    if (fs.existsSync(sourceJpg)) fs.renameSync(sourceJpg, path.join(thumbsDir, `${name}.jpg`));
  }
}

async function ensureImages(name, slug) {
  const outDir = path.join(imageRoot, slug);
  const thumbsDir = path.join(thumbRoot, slug);
  if (fs.existsSync(path.join(outDir, "cover.webp")) && fs.existsSync(path.join(outDir, "scene-5.webp"))) return;
  const rawDir = path.join(rawRoot, slug);
  fs.rmSync(rawDir, { recursive: true, force: true });
  fs.mkdirSync(rawDir, { recursive: true });
  let urls = [];
  try {
    urls = await commonsImages(name, 6);
  } catch (err) {
    console.warn(`image search failed for ${name}: ${err.message}`);
  }
  if (urls.length < 6) {
    const fallback = ["cover", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5"].map((n) => path.join(imageRoot, "great-wall", `${n === "cover" ? "cover" : n}.webp`));
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(thumbsDir, { recursive: true });
    for (let i = 0; i < 6; i++) {
      fs.copyFileSync(fallback[i] || fallback[0], path.join(outDir, `${i === 0 ? "cover" : `scene-${i}`}.webp`));
      fs.copyFileSync(path.join(thumbRoot, "great-wall", `${i === 0 ? "cover" : `scene-${i}`}.jpg`), path.join(thumbsDir, `${i === 0 ? "cover" : `scene-${i}`}.jpg`));
    }
    return;
  }
  const rawNames = ["cover-source.jpg", "scene-1-source.jpg", "scene-2-source.jpg", "scene-3-source.jpg", "scene-4-source.jpg", "scene-5-source.jpg"];
  let saved = 0;
  let failures = 0;
  for (const url of urls) {
    if (saved >= rawNames.length) break;
    if (failures >= 2) break;
    try {
      await download(url, path.join(rawDir, rawNames[saved]));
      saved++;
      await sleep(350);
    } catch (err) {
      console.warn(`skip image for ${name}: ${err.message}`);
      failures++;
      if (/429/.test(err.message)) break;
      await sleep(300);
    }
  }
  if (saved < rawNames.length) {
    const fallback = ["cover", "scene-1", "scene-2", "scene-3", "scene-4", "scene-5"].map((n) => path.join(imageRoot, "great-wall", `${n === "cover" ? "cover" : n}.webp`));
    fs.mkdirSync(outDir, { recursive: true });
    fs.mkdirSync(thumbsDir, { recursive: true });
    for (let i = 0; i < 6; i++) {
      fs.copyFileSync(fallback[i] || fallback[0], path.join(outDir, `${i === 0 ? "cover" : `scene-${i}`}.webp`));
      fs.copyFileSync(path.join(thumbRoot, "great-wall", `${i === 0 ? "cover" : `scene-${i}`}.jpg`), path.join(thumbsDir, `${i === 0 ? "cover" : `scene-${i}`}.jpg`));
    }
    fs.rmSync(rawDir, { recursive: true, force: true });
    return;
  }
  convert(rawDir, outDir, thumbsDir);
  fs.rmSync(rawDir, { recursive: true, force: true });
}

async function main() {
  fs.mkdirSync(travelDir, { recursive: true });
  fs.mkdirSync(imageRoot, { recursive: true });
  fs.mkdirSync(thumbRoot, { recursive: true });
  const items = parseList();
  for (const { rank, name } of items) {
    if (existingByName.has(name)) continue;
    const slug = slugMap[name];
    if (!slug) throw new Error(`missing slug for ${name}`);
    const file = path.join(travelDir, `${slug}.md`);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, article(name, rank, slug), "utf8");
    }
    console.log(`${rank}. ${name} -> ${slug}`);
    await ensureImages(name, slug);
  }
  fs.rmSync(rawRoot, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
