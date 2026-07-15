# 博客交互中枢实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变首页顶部个人信息和左右两栏布局的前提下，增加轻量、可搜索、键盘友好的交互中枢与即时操作反馈。

**Architecture:** Astro 在构建时根据现有导航、分类和文章生成静态命令项；首页现有内联脚本负责打开对话框、过滤结果、切换面板、分享和提示。功能只改首页并新增一份专门的构建结果测试，不增加运行时依赖。

**Tech Stack:** Astro 7、原生 HTML/CSS/JavaScript、Node.js Test Runner、GitHub Pages。

## Global Constraints

- 保留当前顶部个人信息和 `196px + 内容区` 两栏布局。
- 不增加第三方依赖、数据库、公开评论、用户账号或服务端点赞。
- 不增加 `backdrop-filter`、`filter: blur()`、鼠标追踪、粒子效果或无限动画。
- 所有链接继续通过 `/hilavera-blog/` 基础路径正确生成。
- 鼠标和键盘流程都必须可用，并遵守 `prefers-reduced-motion`。

## File Map

- Modify: `src/pages/index.astro` — 生成命令数据、渲染交互界面、提供样式和所有首页交互行为。
- Create: `tests/homepage-command-center.test.mjs` — 验证构建后的命令中枢、状态快捷入口、分享提示和键盘行为。
- Modify: `tests/performance-budget.test.mjs` — 防止交互升级重新引入持续动画和高成本指针效果。

---

### Task 1: 快速探索中枢

**Files:**
- Modify: `src/pages/index.astro:28-64`
- Modify: `src/pages/index.astro:71-744`
- Modify: `src/pages/index.astro:755-1058`
- Modify: `src/pages/index.astro:1059-1211`
- Create: `tests/homepage-command-center.test.mjs`

**Interfaces:**
- Consumes: `navItems`, `categoryCounts`, `posts`, `withBase()`。
- Produces: `[data-command-trigger]`, `[data-command-dialog]`, `[data-command-search]`, `[data-command-item]`, `openCommandCenter()`, `filterCommandItems()`, `runCommand()`。

- [ ] **Step 1: 写入命令中枢失败测试**

```js
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
```

- [ ] **Step 2: 运行测试并确认缺少功能时失败**

Run: `npm run build && node --test tests/homepage-command-center.test.mjs`

Expected: FAIL，首个失败信息包含 `data-command-trigger` 未匹配。

- [ ] **Step 3: 生成命令数据并渲染对话框**

在首页 frontmatter 中加入：

```js
const commandItems = [
	...navItems.map((item) => ({
		kind: 'panel',
		label: item.label,
		description: item.summary,
		target: item.id,
		search: `${item.label} ${item.summary}`,
	})),
	...categoryCounts.map(({ category, count }) => ({
		kind: 'category',
		label: category,
		description: `${count} 篇文章`,
		target: category,
		search: `${category} 分类 ${count} 篇文章`,
	})),
	...posts.map((post) => ({
		kind: 'post',
		label: post.data.title,
		description: post.data.description,
		href: withBase(`/blog/${post.id}/`),
		search: `${post.data.title} ${post.data.description} ${post.data.category} ${post.data.tags.join(' ')}`,
	})),
];
```

在 hero 内加入触发按钮，并在 `</main>` 前加入对话框：

```astro
<button class="command-trigger focus-ring" type="button" data-command-trigger aria-haspopup="dialog">
	<span>快速探索</span>
	<kbd>⌘ K</kbd>
</button>

<dialog class="command-dialog" data-command-dialog aria-labelledby="command-title">
	<div class="command-shell">
		<header class="command-header">
			<div>
				<p class="command-kicker">COMMAND CENTER</p>
				<h2 id="command-title">快速探索</h2>
			</div>
			<button class="command-close focus-ring" type="button" data-command-close aria-label="关闭快速探索">ESC</button>
		</header>
		<label class="command-search-field">
			<span class="tool-label">搜索</span>
			<input
				class="focus-ring"
				type="search"
				role="combobox"
				aria-controls="command-list"
				aria-autocomplete="list"
				aria-expanded="true"
				data-command-search
				placeholder="搜索面板、分类或文章"
				autocomplete="off"
			/>
		</label>
		<ul class="command-list" id="command-list" data-command-list role="listbox" aria-label="探索结果">
			{commandItems.map((item, index) => (
				<li>
					<button
						id={`command-item-${index}`}
						class="command-item focus-ring"
						type="button"
						role="option"
						aria-selected={index === 0 ? 'true' : 'false'}
						data-command-item
						data-command-kind={item.kind}
						data-command-target={item.target}
						data-command-href={item.href}
						data-command-search={item.search}
					>
						<span><strong>{item.label}</strong><small>{item.description}</small></span>
						<em>{item.kind}</em>
					</button>
				</li>
			))}
		</ul>
		<p class="command-empty" data-command-empty hidden>没有匹配结果，换个关键词试试。</p>
	</div>
</dialog>
```

- [ ] **Step 4: 添加轻量样式**

```css
.command-trigger {
	align-items: center;
	background: rgba(var(--premium-ink-rgb), 58%);
	border: 1px solid var(--premium-border-strong);
	border-radius: 10px;
	color: var(--premium-text);
	cursor: pointer;
	display: inline-flex;
	font: inherit;
	font-weight: 700;
	gap: 0.7rem;
	margin-top: 1rem;
	padding: 0.55rem 0.75rem;
}
.command-trigger kbd,
.command-close {
	color: var(--premium-accent);
	font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.command-dialog {
	background: transparent;
	border: 0;
	color: var(--premium-soft);
	max-height: min(680px, calc(100vh - 2rem));
	max-width: min(680px, calc(100% - 2rem));
	padding: 0;
	width: 100%;
}
.command-dialog::backdrop { background: rgba(2, 6, 18, 76%); }
.command-shell {
	background: var(--premium-panel-strong);
	border: 1px solid var(--premium-border-strong);
	border-radius: var(--premium-radius);
	box-shadow: var(--premium-shadow), var(--premium-inset);
	overflow: hidden;
	padding: 1rem;
}
.command-list {
	display: grid;
	gap: 0.35rem;
	list-style: none;
	margin: 0.8rem 0 0;
	max-height: 390px;
	overflow: auto;
	padding: 0;
}
.command-item {
	align-items: center;
	background: transparent;
	border: 1px solid transparent;
	border-radius: 10px;
	color: var(--premium-soft);
	cursor: pointer;
	display: flex;
	font: inherit;
	justify-content: space-between;
	padding: 0.62rem;
	text-align: left;
	width: 100%;
}
.command-item[aria-selected='true'],
.command-item:hover {
	background: rgba(56, 189, 248, 10%);
	border-color: var(--premium-border-strong);
}
.command-item span,
.command-item small { display: block; }
.command-item strong { color: var(--premium-text); }
.command-item small { color: var(--premium-muted); }
```

- [ ] **Step 5: 实现打开、过滤、键盘选择和执行**

```js
const commandTrigger = document.querySelector('[data-command-trigger]');
const commandDialog = document.querySelector('[data-command-dialog]');
const commandClose = document.querySelector('[data-command-close]');
const commandSearch = document.querySelector('[data-command-search]');
const commandEmpty = document.querySelector('[data-command-empty]');
const commandItems = Array.from(document.querySelectorAll('[data-command-item]'));
let activeCommandIndex = 0;

function visibleCommandItems() {
	return commandItems.filter((item) => !item.hidden);
}

function setActiveCommand(index) {
	const visibleItems = visibleCommandItems();
	if (!visibleItems.length) return;
	activeCommandIndex = (index + visibleItems.length) % visibleItems.length;
	visibleItems.forEach((item, itemIndex) => {
		item.setAttribute('aria-selected', String(itemIndex === activeCommandIndex));
	});
	commandSearch?.setAttribute('aria-activedescendant', visibleItems[activeCommandIndex].id);
	visibleItems[activeCommandIndex]?.scrollIntoView({ block: 'nearest' });
}

function filterCommandItems() {
	const query = normalizeText(commandSearch?.value);
	commandItems.forEach((item) => {
		item.hidden = Boolean(query) && !normalizeText(item.dataset.commandSearch).includes(query);
	});
	if (commandEmpty) commandEmpty.hidden = visibleCommandItems().length !== 0;
	setActiveCommand(0);
}

function openCommandCenter() {
	if (!commandDialog || commandDialog.open) return;
	commandDialog.showModal();
	commandSearch?.focus();
	filterCommandItems();
}

function closeCommandCenter() {
	commandDialog?.close();
	commandTrigger?.focus();
}

function runCommand(item) {
	if (item.dataset.commandKind === 'panel') {
		showPanel(item.dataset.commandTarget, { focusPanel: true });
	} else if (item.dataset.commandKind === 'category') {
		if (categoryFilter) categoryFilter.value = item.dataset.commandTarget || '';
		showPanel('posts', { focusPanel: true });
		filterPosts();
	} else if (item.dataset.commandHref) {
		window.location.assign(item.dataset.commandHref);
		return;
	}
	closeCommandCenter();
}

commandTrigger?.addEventListener('click', openCommandCenter);
commandClose?.addEventListener('click', closeCommandCenter);
commandSearch?.addEventListener('input', filterCommandItems);
commandSearch?.addEventListener('keydown', (event) => {
	if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
		event.preventDefault();
		setActiveCommand(activeCommandIndex + (event.key === 'ArrowDown' ? 1 : -1));
	}
	if (event.key === 'Enter') {
		event.preventDefault();
		const selectedItem = visibleCommandItems()[activeCommandIndex];
		if (selectedItem) runCommand(selectedItem);
	}
});
commandItems.forEach((item) => item.addEventListener('click', () => runCommand(item)));
document.addEventListener('keydown', (event) => {
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		openCommandCenter();
	}
	if (event.key === 'Escape' && commandDialog?.open) closeCommandCenter();
});
```

- [ ] **Step 6: 构建并确认命令中枢测试通过**

Run: `npm run build && node --test tests/homepage-command-center.test.mjs`

Expected: 2 tests PASS。

- [ ] **Step 7: 提交命令中枢**

```bash
git add src/pages/index.astro tests/homepage-command-center.test.mjs
git commit -m "feat: add homepage command center"
```

---

### Task 2: 状态快捷入口、键盘标签和历史导航

**Files:**
- Modify: `src/pages/index.astro:28-32`
- Modify: `src/pages/index.astro:788-799`
- Modify: `src/pages/index.astro:1123-1211`
- Modify: `tests/homepage-command-center.test.mjs`

**Interfaces:**
- Consumes: `showPanel()`, `filterPosts()`, `[data-panel-target]`, `[data-category-filter]`。
- Produces: `[data-status-target]`, `showPanel(panelId, options)`, `focusPanelHeading(panelId)`，并监听 `hashchange` 和标签栏方向键。

- [ ] **Step 1: 写入快捷导航失败测试**

```js
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
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run build && node --test tests/homepage-command-center.test.mjs`

Expected: FAIL，缺少 `data-status-target="home"`。

- [ ] **Step 3: 将状态卡改为快捷按钮**

```js
const statusItems = [
	{ label: 'NOW', value: 'Astro + GitHub Pages', target: 'home' },
	{ label: 'LEARNING', value: 'JavaScript / CSS / Markdown', target: 'posts' },
	{ label: 'NEXT', value: 'TypeScript 基础和组件拆分', target: 'about' },
];
```

```astro
<button class="status-chip focus-ring" type="button" data-status-target={item.target}>
	<span>{item.label}</span>
	<strong>{item.value}</strong>
</button>
```

同时为 `.status-chip` 补 `cursor: pointer; font: inherit; text-align: left;`，保持原尺寸和网格不变。

- [ ] **Step 4: 扩展面板切换与历史行为**

```js
function focusPanelHeading(panelId) {
	const heading = document.querySelector(`[data-panel="${panelId}"] h2`);
	if (!heading) return;
	heading.setAttribute('tabindex', '-1');
	heading.focus({ preventScroll: true });
}

function showPanel(panelId, { updateHash = true, focusPanel = false } = {}) {
	tabs.forEach((tab) => {
		const isActive = tab.dataset.panelTarget === panelId;
		tab.classList.toggle('is-active', isActive);
		tab.setAttribute('aria-selected', String(isActive));
		tab.tabIndex = isActive ? 0 : -1;
	});

	panels.forEach((panel) => {
		const isActive = panel.dataset.panel === panelId;
		panel.classList.toggle('is-active', isActive);
		panel.toggleAttribute('hidden', !isActive);
		if (isActive) {
			panel.classList.remove('soft-reveal');
			void panel.offsetWidth;
			panel.classList.add('soft-reveal');
		}
	});

	if (updateHash && window.location.hash !== `#${panelId}`) {
		window.history.pushState(null, '', `#${panelId}`);
	}
	if (focusPanel) focusPanelHeading(panelId);
}
```

```js
tabs.forEach((tab, index) => {
	tab.addEventListener('click', () => showPanel(tab.dataset.panelTarget));
	tab.addEventListener('keydown', (event) => {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		event.preventDefault();
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
		nextTab?.focus();
		showPanel(nextTab?.dataset.panelTarget);
	});
});

document.querySelectorAll('[data-status-target]').forEach((button) => {
	button.addEventListener('click', () => showPanel(button.dataset.statusTarget, { focusPanel: true }));
});

window.addEventListener('hashchange', () => {
	const panelId = window.location.hash.replace('#', '');
	if (tabs.some((tab) => tab.dataset.panelTarget === panelId)) {
		showPanel(panelId, { updateHash: false });
	}
});

const initialPanel = window.location.hash.replace('#', '');
if (tabs.some((tab) => tab.dataset.panelTarget === initialPanel)) {
	showPanel(initialPanel, { updateHash: false });
}
```

- [ ] **Step 5: 运行导航测试和原有首页测试**

Run: `npm run build && node --test tests/homepage-command-center.test.mjs tests/homepage-space.test.mjs`

Expected: 两个文件内全部测试 PASS。

- [ ] **Step 6: 提交导航增强**

```bash
git add src/pages/index.astro tests/homepage-command-center.test.mjs
git commit -m "feat: improve homepage navigation"
```

---

### Task 3: 分享、复制、草稿保存和统一提示

**Files:**
- Modify: `src/pages/index.astro:494-579`
- Modify: `src/pages/index.astro:1007-1050`
- Modify: `src/pages/index.astro:1059-1211`
- Modify: `tests/homepage-command-center.test.mjs`

**Interfaces:**
- Consumes: `readVisitorState()`, `writeVisitorState()`, `saveCommentDraft()`。
- Produces: `[data-share-button]`, `[data-copy-link-button]`, `[data-save-draft-button]`, `[data-toast]`, `showToast()`, `copyCurrentUrl()`, `shareCurrentPage()`。

- [ ] **Step 1: 写入即时反馈失败测试**

```js
test('visitor actions expose share copy save and toast feedback', () => {
	for (const hook of [
		'data-share-button',
		'data-copy-link-button',
		'data-save-draft-button',
		'data-toast',
	]) {
		assert.match(html, new RegExp(hook));
	}

	assert.match(html, /role="status"/);
	assert.match(html, /aria-live="polite"/);
	assert.match(source, /function showToast/);
	assert.match(source, /async function copyCurrentUrl/);
	assert.match(source, /async function shareCurrentPage/);
	assert.match(source, /navigator\.share/);
	assert.match(source, /navigator\.clipboard/);
});

test('visitor state writes fall back when local storage is unavailable', () => {
	assert.match(source, /let memoryVisitorState/);
	assert.match(source, /memoryVisitorState = state/);
	assert.match(source, /catch \{/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run build && node --test tests/homepage-command-center.test.mjs`

Expected: FAIL，缺少 `data-share-button`。

- [ ] **Step 3: 渲染操作按钮与提示区域**

在 `.interaction-actions` 中加入：

```astro
<button class="interaction-button focus-ring" type="button" data-save-draft-button>保存草稿</button>
<button class="interaction-button focus-ring" type="button" data-share-button>分享页面</button>
<button class="interaction-button focus-ring" type="button" data-copy-link-button>复制链接</button>
```

在对话框之后加入：

```astro
<p class="action-toast" data-toast role="status" aria-live="polite" aria-atomic="true" hidden></p>
```

```css
.action-toast {
	background: var(--premium-panel-strong);
	border: 1px solid var(--premium-border-strong);
	border-radius: 10px;
	bottom: 1rem;
	box-shadow: var(--premium-shadow);
	color: var(--premium-text);
	left: 50%;
	margin: 0;
	max-width: calc(100% - 2rem);
	padding: 0.62rem 0.82rem;
	position: fixed;
	transform: translateX(-50%);
	z-index: 20;
}
```

- [ ] **Step 4: 增加存储降级和统一反馈**

```js
const shareButton = document.querySelector('[data-share-button]');
const copyLinkButton = document.querySelector('[data-copy-link-button]');
const saveDraftButton = document.querySelector('[data-save-draft-button]');
const toast = document.querySelector('[data-toast]');
let memoryVisitorState = { name: '', liked: false, favorite: false, likes: 0, comment: '' };
let toastTimer;

function readVisitorState() {
	try {
		const savedState = window.localStorage.getItem(visitorStorageKey);
		return savedState ? JSON.parse(savedState) : memoryVisitorState;
	} catch {
		return memoryVisitorState;
	}
}

function writeVisitorState(state) {
	memoryVisitorState = state;
	try {
		window.localStorage.setItem(visitorStorageKey, JSON.stringify(state));
	} catch {
		// The in-memory state remains usable for this page visit.
	}
}

function showToast(message) {
	if (!toast) return;
	window.clearTimeout(toastTimer);
	toast.textContent = message;
	toast.hidden = false;
	toastTimer = window.setTimeout(() => {
		toast.hidden = true;
	}, 2200);
}

async function copyCurrentUrl() {
	const url = window.location.href;
	try {
		await navigator.clipboard.writeText(url);
	} catch {
		const fallback = document.createElement('textarea');
		fallback.value = url;
		fallback.setAttribute('readonly', '');
		document.body.append(fallback);
		fallback.select();
		document.execCommand('copy');
		fallback.remove();
	}
	showToast('链接已复制。');
}

async function shareCurrentPage() {
	if (navigator.share) {
		try {
			await navigator.share({ title: document.title, url: window.location.href });
			showToast('分享面板已打开。');
			return;
		} catch (error) {
			if (error?.name === 'AbortError') return;
		}
	}
	await copyCurrentUrl();
}
```

为按钮补监听，并在点赞、收藏和显式保存草稿后调用 `showToast()`：

```js
saveDraftButton?.addEventListener('click', () => {
	saveCommentDraft();
	showToast('留言草稿已保存在当前浏览器。');
});
shareButton?.addEventListener('click', shareCurrentPage);
copyLinkButton?.addEventListener('click', copyCurrentUrl);

likeButton?.addEventListener('click', () => {
	const nextState = getVisitorStateFromInputs();
	nextState.liked = !nextState.liked;
	nextState.likes = nextState.liked ? 1 : 0;
	writeVisitorState(nextState);
	updateVisitorState(nextState);
	showToast(nextState.liked ? '已在当前浏览器点赞。' : '已取消本地点赞。');
});

favoriteButton?.addEventListener('click', () => {
	const nextState = getVisitorStateFromInputs();
	nextState.favorite = !nextState.favorite;
	writeVisitorState(nextState);
	updateVisitorState(nextState);
	showToast(nextState.favorite ? '已加入本地收藏。' : '已取消本地收藏。');
});
```

- [ ] **Step 5: 运行反馈测试和完整测试**

Run: `npm run build && npm test`

Expected: 所有测试 PASS，构建无警告或错误。

- [ ] **Step 6: 提交互动反馈**

```bash
git add src/pages/index.astro tests/homepage-command-center.test.mjs
git commit -m "feat: add homepage interaction feedback"
```

---

### Task 4: 性能回归、浏览器验收与发布

**Files:**
- Modify: `tests/performance-budget.test.mjs`

**Interfaces:**
- Consumes: 完整首页交互和现有性能预算。
- Produces: 明确的交互性能防线、通过的生产构建和线上 GitHub Pages 页面。

- [ ] **Step 1: 写入事件驱动性能回归测试**

```js
test('homepage interactions avoid pointer tracking and infinite motion', () => {
	const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
	assert.doesNotMatch(homepage, /pointermove/);
	assert.doesNotMatch(homepage, /mousemove/);
	assert.doesNotMatch(homepage, /requestAnimationFrame/);
	assert.doesNotMatch(homepage, /animation-iteration-count:\s*infinite/);
});
```

- [ ] **Step 2: 运行性能回归测试**

Run: `node --test tests/performance-budget.test.mjs`

Expected: 全部测试 PASS，首页源码不包含四种禁止模式。

- [ ] **Step 3: 运行全部静态验证**

Run: `npm run build`

Expected: Astro 成功生成全部页面。

Run: `npm test`

Expected: 全部测试 PASS。

Run: `git diff --check`

Expected: 无输出。

- [ ] **Step 4: 启动本地站点并在 Chrome 验收**

Run: `npx astro dev --background`

Open in Chrome: `http://localhost:4321/hilavera-blog/?interaction=command-center`

检查桌面和移动端：打开/关闭命令中枢、搜索、方向键选择、状态快捷入口、分类筛选、点赞/收藏、保存草稿、分享/复制、浏览器前进/后退，并确认没有持续动画或明显卡顿。

Run after inspection: `npx astro dev stop`

Expected: 开发服务器停止且无遗留进程。

- [ ] **Step 5: 提交性能测试或验收修正**

```bash
git add tests/performance-budget.test.mjs
git commit -m "test: protect homepage interaction performance"
```

- [ ] **Step 6: 推送并等待 GitHub Pages 发布**

Run: `git push origin main`

Expected: `main` 推送成功。

Run: `gh run list --workflow deploy.yml --limit 1`

Expected: 最新运行对应当前提交；等待状态变为 `completed success`。

- [ ] **Step 7: 验证线上页面**

Run: `curl -I https://hilavera.github.io/hilavera-blog/`

Expected: HTTP `200`。

Run: `curl -fsSL https://hilavera.github.io/hilavera-blog/ | rg "data-command-trigger|data-command-dialog|data-toast"`

Expected: 三个新交互钩子均存在。
