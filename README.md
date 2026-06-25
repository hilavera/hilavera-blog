# Hila 的博客

这是一个用 Astro 构建的综合性个人博客，当前包含首页、文章列表、分类标签页、关于页、RSS 和站点地图。

## 常用命令

所有命令都在这个目录执行：

```sh
cd /Users/hilavera/Desktop/github/my-blog
```

启动本地预览：

```sh
npm run dev
```

构建检查：

```sh
npm run build
```

预览构建结果：

```sh
npm run preview
```

## 写新文章

文章放在：

```text
src/content/blog/
```

新建一篇 Markdown 文件，例如：

```text
src/content/blog/my-new-post.md
```

文章开头需要包含这些信息：

```md
---
title: '文章标题'
description: '一句话简介'
pubDate: '2026-06-25'
category: '技术'
tags: ['Markdown', '写作']
heroImage: '../../assets/blog-placeholder-1.jpg'
---

这里写正文。
```

## 主要目录

```text
src/pages/          页面：首页、文章页、分类页、关于页
src/content/blog/   博客文章
src/components/     公共组件
src/layouts/        文章布局
src/styles/         全局样式
src/assets/         站内图片和字体
public/             favicon 等静态文件
```

## 发布

计划发布到公开 GitHub 仓库 `hilavera-blog`，并用 GitHub Actions 部署到 GitHub Pages。

上线地址：

```text
https://hilavera.github.io/hilavera-blog/
```

发布配置文件：

```text
.github/workflows/deploy.yml
```

GitHub Pages 项目站点需要 `astro.config.mjs` 配置 `site` 和 `base`。当前配置：

```js
site: 'https://hilavera.github.io',
base: '/hilavera-blog',
```
