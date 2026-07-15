import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const articleHtml = readFileSync(
	new URL('../dist/blog/dev-workflow-loop/index.html', import.meta.url),
	'utf8',
);
const articleSource = readFileSync(
	new URL('../src/content/blog/dev-workflow-loop.md', import.meta.url),
	'utf8',
);
const layoutSource = readFileSync(new URL('../src/layouts/BlogPost.astro', import.meta.url), 'utf8');
const routeSource = readFileSync(
	new URL('../src/pages/blog/%5B...slug%5D.astro', import.meta.url),
	'utf8',
);
const blogIndexHtml = readFileSync(new URL('../dist/blog/index.html', import.meta.url), 'utf8');

test('article detail pages use the dark tech reading shell', () => {
	for (const className of [
		'article-shell',
		'article-main',
		'article-prose',
		'article-aside',
		'executive-glass',
		'luxe-border',
	]) {
		assert.match(articleHtml, new RegExp(className));
		assert.match(layoutSource, new RegExp(className));
	}

	for (const text of ['本篇速览', '阅读建议', '相关阅读']) {
		assert.match(articleHtml, new RegExp(text));
	}
});

test('article detail pages include reading metadata and navigation data', () => {
	for (const text of ['阅读', '分类', '标签', '2026年7月15日', '上一篇', '分类地图']) {
		assert.match(articleHtml, new RegExp(text));
	}

	for (const hook of ['readingTime', 'relatedPosts', 'newerPost', 'olderPost', 'toc']) {
		assert.match(routeSource, new RegExp(hook));
	}
	assert.match(layoutSource, /更新一篇/);
});

test('new workflow article is published into the article index', () => {
	for (const text of ['我的博客开发闭环', '需求判断', '自动检查', '线上验证']) {
		assert.match(articleSource, new RegExp(text));
	}

	assert.match(blogIndexHtml, /我的博客开发闭环：从改页面到上线验证/);
	assert.match(blogIndexHtml, /开发闭环/);
});
