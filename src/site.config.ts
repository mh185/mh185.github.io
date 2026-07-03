export const SITE_SETTINGS = {
  title: "我的博客",
  description: "记录想法,分享我正在学习的东西。",
  owner: "站长",
  ogImages:
    "https://res.cloudinary.com/dellp9a4z/image/upload/v1756758385/og-home_ejuqq8.png",
  socials: [
    {
      icon: "github",
      label: "GitHub",
      url: "https://github.com/truedaniyyel",
      handle: "truedaniyyel",
    },
  ],
};

export const header = [
  {
    name: "博客",
    url: "/blog",
  },
  {
    name: "项目",
    url: "/projects",
  },
  {
    name: "关于",
    url: "/about",
  },
];

export const footer = [
  {
    title: "内容",
    links: [
      {
        name: "搜索",
        url: "/search",
      },
      {
        name: "博客",
        url: "/blog",
      },
      {
        name: "项目",
        url: "/projects",
      },
      {
        name: "关于",
        url: "/about",
      },
    ],
  },
  {
    title: "资源",
    links: [
      {
        name: "RSS",
        url: "/rss.xml",
      },
      {
        name: "站点地图",
        url: "/sitemap-index.xml",
      },
    ],
  },
];
