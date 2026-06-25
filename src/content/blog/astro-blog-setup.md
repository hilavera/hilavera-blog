---
title: '入门开发者：我如何把 Astro 博客发布到 GitHub Pages'
description: '从本地项目到线上地址，记录第一次把个人博客部署成功的完整过程。'
pubDate: '2026-06-25'
category: '项目复盘'
tags: ['入门开发者', 'Astro', 'GitHub Pages', '部署']
heroImage: '../../assets/blog-placeholder-5.jpg'
---

这是我作为入门开发者完成的第一个完整发布流程：本地创建 Astro 博客，把代码推到 GitHub，再通过 GitHub Pages 自动发布。

## 目标

这次不是只看教程，而是把一个能访问的页面真正发出去。最终结果需要满足三件事：

- 本地能运行博客
- GitHub 仓库里有完整代码
- 线上地址能打开页面

## 我用到的工具

- **Astro**：生成静态博客
- **GitHub**：保存代码
- **GitHub Pages**：托管网站
- **GitHub Actions**：每次推送后自动构建和发布
- **Markdown**：写文章内容

## 实际步骤

### 1. 创建项目

```bash
npm create astro@latest my-blog
cd my-blog
npm install
```

我选择了博客模板，因为它自带文章列表、文章详情、RSS 和基本样式。

### 2. 配置仓库路径

我的网站不是部署在根域名，而是部署在：

```text
https://hilavera.github.io/hilavera-blog/
```

所以 `astro.config.mjs` 里需要配置 `site` 和 `base`。这一步很关键，如果漏了，页面里的 CSS、图片和链接就容易 404。

### 3. 配置自动部署

我在 `.github/workflows/deploy.yml` 里配置 GitHub Actions。核心流程是：

1. 拉取代码
2. 安装依赖
3. 执行 `npm run build`
4. 上传 `dist`
5. 发布到 GitHub Pages

## 踩坑记录

### 路径不是 `/`

刚开始我以为所有链接都可以直接写 `/blog/`，后来发现部署到子路径时会错。解决办法是写一个 `withBase()` 方法，统一给站内链接补上 base 路径。

### 构建成功不等于页面正常

`npm run build` 成功只能说明项目能生成静态文件，不代表线上路径一定对。所以我每次发布后都会打开真实网址检查。

### 文章图片路径要写准

Markdown frontmatter 里的 `heroImage` 指向 `src/assets`，路径写错会直接构建失败。这个错误反而有帮助，因为它能在发布前暴露问题。

## 这次学到什么

我对“发布一个网站”有了更清楚的理解：写代码只是其中一部分，路径、构建、仓库、部署配置也都属于开发工作。

下一步我会继续把首页做成更像个人开发空间的样子，并记录每次改动背后的原因。
