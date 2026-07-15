import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styleSources = [
	'src/styles/global.css',
	'src/pages/index.astro',
	'src/layouts/TechPage.astro',
	'src/layouts/BlogPost.astro',
	'src/components/Header.astro',
	'src/components/Footer.astro',
	'src/pages/blog/index.astro',
].map((file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

const combinedStyles = styleSources.join('\n');

test('visual system avoids high-cost always-on paint effects', () => {
	for (const expensivePattern of [
		/backdrop-filter/,
		/filter:\s/,
		/blur\(/,
		/animation:\s*scanDrift/,
		/animation:\s*signalPulse/,
		/@keyframes scanDrift/,
		/@keyframes signalPulse/,
	]) {
		assert.doesNotMatch(combinedStyles, expensivePattern);
	}
});

test('visual system keeps lightweight premium styling hooks', () => {
	for (const expectedToken of [
		'--premium-shadow: 0 12px 34px',
		'--premium-glow: 0 0 18px',
		'executive-glass',
		'luxe-border',
	]) {
		assert.match(combinedStyles, new RegExp(expectedToken.replace(/[()]/g, '\\$&')));
	}
});

test('homepage interactions avoid pointer tracking and infinite motion', () => {
	const homepage = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

	for (const expensivePattern of [
		/pointermove/,
		/mousemove/,
		/requestAnimationFrame/,
		/animation-iteration-count:\s*infinite/,
	]) {
		assert.doesNotMatch(homepage, expensivePattern);
	}
});
