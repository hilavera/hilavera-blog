import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('home page exposes a searchable command center', () => {
	for (const hook of [
		'data-command-trigger',
		'data-command-dialog',
		'data-command-search',
		'data-command-list',
		'data-command-item',
		'data-command-empty',
	]) {
		assert.match(html, new RegExp(hook));
	}

	assert.match(html, /快速探索/);
	assert.match(html, /搜索面板、分类或文章/);
	assert.match(html, /role="listbox"/);
	assert.match(html, /role="option"/);
});

test('command center includes panels categories and posts', () => {
	for (const kind of ['panel', 'category', 'post']) {
		assert.match(html, new RegExp(`data-command-kind="${kind}"`));
	}

	for (const behavior of [
		'function openCommandCenter',
		'function closeCommandCenter',
		'function filterCommandItems',
		'function runCommand',
	]) {
		assert.match(source, new RegExp(behavior));
	}
});

test('status cards and sidebar support direct keyboard navigation', () => {
	assert.match(html, /data-status-target="home"/);
	assert.match(html, /data-status-target="posts"/);
	assert.match(html, /data-status-target="about"/);
	assert.match(source, /function focusPanelHeading/);
	assert.match(source, /event\.key === 'ArrowRight'/);
	assert.match(source, /event\.key === 'ArrowLeft'/);
});

test('panel state follows browser history', () => {
	assert.match(source, /window\.history\.pushState/);
	assert.match(source, /window\.addEventListener\('hashchange'/);
	assert.match(source, /updateHash: false/);
});
