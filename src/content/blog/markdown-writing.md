---
title: '用 Markdown 写博客文章'
description: '博客文章主要用 Markdown 写，结构简单，也方便以后迁移。'
pubDate: '2026-06-25'
category: '技术'
tags: ['Markdown', '写作', 'Astro']
heroImage: '../../assets/blog-placeholder-1.jpg'
---

这个博客里的文章放在 `src/content/blog/` 文件夹里，每篇文章就是一个 Markdown 文件。

一篇文章通常分成两部分：前面的文章信息和后面的正文。

```md
---
title: 文章标题
description: 一句话简介
pubDate: 2026-06-25
category: 技术
tags: ['Markdown', '写作']
---

这里写正文。
```

正文里可以写标题、列表、链接、代码块和图片。以后新增文章时，只需要复制一篇现有文章，改标题、日期、分类、标签和正文即可。
