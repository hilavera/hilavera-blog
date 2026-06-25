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

test('blog posts read like entry-level developer publishing notes', () => {
	const combinedArticles = articleSources.join('\n');

	for (const text of ['入门开发者', '开发日志', '踩坑记录', 'GitHub Pages']) {
		assert.match(combinedArticles, new RegExp(text));
	}
});
