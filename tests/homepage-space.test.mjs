import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const articleSources = [
	'astro-blog-setup.md',
	'hello-blog.md',
	'life-weekly.md',
	'markdown-writing.md',
	'reading-note-template.md',
].map((file) => readFileSync(new URL(`../src/content/blog/${file}`, import.meta.url), 'utf8'));

test('home page renders the personal space layout shell', () => {
	assert.match(html, /data-space-home/);
	assert.match(html, /<h1[^>]*>\s*hilavera/);
	assert.match(html, />hilavera 的博客</);
	assert.doesNotMatch(html, /Hila 的博客/);
	assert.match(html, /class="space-layout"/);
	assert.match(html, /class="space-sidebar"/);
	assert.match(html, /class="space-content"/);
});

test('home page wires left navigation to right side panels', () => {
	for (const panel of ['home', 'posts', 'categories', 'about']) {
		assert.match(html, new RegExp(`data-panel-target="${panel}"`));
		assert.match(html, new RegExp(`id="panel-${panel}"`));
	}

	assert.match(html, /aria-selected="true"/);
	assert.match(html, /hidden/);
	assert.match(html, /function showPanel/);
});

test('home page presents an entry-level developer space with tech styling', () => {
	for (const text of ['入门开发者', '学习路线', '项目复盘', '工具配置']) {
		assert.match(html, new RegExp(text));
	}

	for (const className of ['tech-shell', 'status-chip', 'signal-dot', 'code-line']) {
		assert.match(source, new RegExp(className));
	}
});

test('home page keeps a compact space proportion', () => {
	for (const cssRule of [
		'width: min(1040px, calc(100% - 2rem))',
		'min-height: 210px',
		'grid-template-columns: 196px minmax(0, 1fr)',
		'min-height: 380px',
	]) {
		assert.match(source, new RegExp(cssRule.replace(/[()]/g, '\\$&')));
	}
});

test('home page includes lightweight blog space enhancements', () => {
	for (const text of ['文章搜索', '分类筛选', '学习进度', '近期计划', '项目卡片', '技术栈']) {
		assert.match(html, new RegExp(text));
	}

	for (const hook of ['data-post-search', 'data-category-filter', 'data-progress-meter', 'data-project-card']) {
		assert.match(source, new RegExp(hook));
	}

	assert.match(source, /function filterPosts/);
});

test('home page includes visual polish layers without changing layout', () => {
	for (const className of ['visual-grid', 'surface-glow', 'soft-reveal', 'focus-ring']) {
		assert.match(source, new RegExp(className));
	}

	for (const motionRule of ['@keyframes panelEnter', '@keyframes scanDrift', '@media (prefers-reduced-motion: reduce)']) {
		assert.match(source, new RegExp(motionRule.replace(/[()]/g, '\\$&')));
	}
});

test('home page includes local-only visitor interactions', () => {
	for (const text of ['访客互动台', '访客昵称', '本地点赞', '本地收藏', '留言草稿']) {
		assert.match(html, new RegExp(text));
	}

	for (const hook of [
		'data-visitor-name',
		'data-like-button',
		'data-favorite-button',
		'data-comment-draft',
		'data-comment-preview',
	]) {
		assert.match(source, new RegExp(hook));
	}

	for (const behavior of ['localStorage', 'function updateVisitorState', 'function saveCommentDraft']) {
		assert.match(source, new RegExp(behavior));
	}
});

test('blog posts read like entry-level developer publishing notes', () => {
	const combinedArticles = articleSources.join('\n');

	for (const text of ['入门开发者', '开发日志', '踩坑记录', 'GitHub Pages']) {
		assert.match(combinedArticles, new RegExp(text));
	}
});
