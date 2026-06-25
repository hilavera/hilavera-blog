---
title: '用 Markdown 写博客文章'
description: '博客文章主要用 Markdown 写，结构简单，也方便以后迁移。'
pubDate: '2026-06-25'
category: '技术'
tags: ['Markdown', '写作', 'Astro']
heroImage: '../../assets/blog-placeholder-1.jpg'
---

这个博客里的文章放在 `src/content/blog/` 文件夹里，每篇文章就是一个 Markdown 文件。

## 文章结构

一篇文章通常分成两部分：前面的文章信息（frontmatter）和后面的正文。

```md
---
title: 文章标题
description: 一句话简介
pubDate: 2026-06-25
category: 技术
tags: ['Markdown', '写作']
heroImage: '../../assets/xxx.jpg'
---

这里写正文。
```

## 常用 Markdown 语法

### 标题

```md
# 一级标题
## 二级标题
### 三级标题
```

### 列表

```md
- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
```

### 代码

行内代码用反引号：`code`

代码块用三个反引号：

````md
```js
console.log('Hello');
```
````

### 链接和图片

```md
[链接文字](https://example.com)
![图片描述](图片路径)
```

### 引用

```md
> 这是一段引用文字。
```

## 新增文章的步骤

1. 在 `src/content/blog/` 里新建一个 `.md` 文件
2. 复制现有文章的 frontmatter，修改标题、日期、分类、标签
3. 写正文
4. push 到 GitHub，自动部署

文件名会成为文章的 URL 路径，比如 `my-first-post.md` 对应 `/blog/my-first-post/`。
