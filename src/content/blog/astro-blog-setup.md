---
title: '用 Astro 搭建博客的完整流程'
description: '从零开始用 Astro + GitHub Pages 搭建个人博客，记录每一步。'
pubDate: '2026-06-25'
category: '技术'
tags: ['Astro', 'GitHub Pages', '博客', '教程']
heroImage: '../../assets/blog-placeholder-5.jpg'
---

这篇记录我用 Astro 搭建博客的完整过程，包括踩过的坑。

## 为什么选 Astro

之前也考虑过 Hugo、Hexo、Next.js，最后选了 Astro，原因很简单：

- **速度快** — 默认生成纯静态 HTML，不带 JavaScript
- **Markdown 友好** — 原生支持 Markdown 和 MDX
- **模板灵活** — 用 `.astro` 文件写组件，学习成本低
- **部署简单** — 配合 GitHub Pages 和 Actions，push 就自动部署

## 初始化项目

```bash
npm create astro@latest my-blog
cd my-blog
npm install
```

选择模板时选「Blog」，会自带文章列表、分类、RSS 等功能。

## 项目结构

```
my-blog/
├── src/
│   ├── content/
│   │   └── blog/          # 文章放这里
│   │       ├── hello.md
│   │       └── post-2.md
│   ├── pages/
│   │   ├── index.astro    # 首页
│   │   ├── about.astro    # 关于页
│   │   └── blog/
│   │       ├── index.astro      # 文章列表
│   │       └── [...slug].astro  # 文章详情
│   ├── components/        # 组件
│   ├── layouts/           # 布局模板
│   └── styles/            # 样式
├── public/                # 静态资源
├── astro.config.mjs       # 配置文件
└── package.json
```

## 配置 GitHub Pages

### 1. 修改 astro.config.mjs

如果仓库名不是 `username.github.io`，需要设置 `base`：

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hilavera.github.io',
  base: '/hilavera-blog',
});
```

### 2. 创建 GitHub Actions 部署配置

在 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3. 在 GitHub 仓库设置中开启 Pages

Settings → Pages → Source 选择「GitHub Actions」。

## 配置路径注意事项

设置了 `base` 之后，所有站内链接都需要加上 base 路径。可以用一个工具函数：

```ts
// src/consts.ts
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}
```

然后在模板里用 `withBase('/blog/')` 代替 `/blog/`。

## 新增文章

在 `src/content/blog/` 里新建 `.md` 文件：

```md
---
title: '文章标题'
description: '一句话简介'
pubDate: '2026-06-25'
category: '技术'
tags: ['标签1', '标签2']
---

正文内容。
```

push 到 GitHub 后，Actions 会自动构建部署。

## 踩过的坑

### 1. 路径问题

最头疼的是路径。设置了 `base` 之后，RSS、sitemap、favicon 的路径都要手动调整，否则部署后会 404。

### 2. 字体加载

Astro 默认用的 Atkinson 字体，如果想换字体，需要修改 `global.css` 里的 `@font-face`。

### 3. 图片路径

文章里的 `heroImage` 用的是相对路径，指向 `src/assets/` 下的图片。如果图片路径写错，构建会报错。

## 总结

整个搭建过程大概花了半天时间，主要时间花在路径配置上。如果你也想搭一个类似的博客，可以直接 fork 我的仓库，改改配置就行。

**仓库地址：** [hilavera-blog](https://github.com/hilavera/hilavera-blog)
