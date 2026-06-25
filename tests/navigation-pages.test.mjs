import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const pages = {
	blog: {
		html: readFileSync(new URL('../dist/blog/index.html', import.meta.url), 'utf8'),
		source: readFileSync(new URL('../src/pages/blog/index.astro', import.meta.url), 'utf8'),
		text: ['开发日志索引', '文章导航', '最新发布', '写作节奏'],
	},
	categories: {
		html: readFileSync(new URL('../dist/categories/index.html', import.meta.url), 'utf8'),
		source: readFileSync(new URL('../src/pages/categories/index.astro', import.meta.url), 'utf8'),
		text: ['学习地图', '分类矩阵', '标签云', '下一步写作方向'],
	},
	about: {
		html: readFileSync(new URL('../dist/about/index.html', import.meta.url), 'utf8'),
		source: readFileSync(new URL('../src/pages/about.astro', import.meta.url), 'utf8'),
		text: ['公开学习档案', '当前进度', '工作流', '下一步计划'],
	},
};
const techPageLayoutSource = readFileSync(new URL('../src/layouts/TechPage.astro', import.meta.url), 'utf8');

test('top navigation pages share the dark tech page shell', () => {
	for (const { html, source } of Object.values(pages)) {
		const combinedSource = `${source}\n${techPageLayoutSource}`;
		for (const className of ['tech-page', 'page-hero', 'surface-card', 'density-grid']) {
			assert.match(html, new RegExp(className));
			assert.match(combinedSource, new RegExp(className));
		}
	}
});

test('top navigation pages include denser developer-focused content', () => {
	for (const { html, text } of Object.values(pages)) {
		for (const expectedText of text) {
			assert.match(html, new RegExp(expectedText));
		}
	}
});
