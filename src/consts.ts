// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Hila 的博客';
export const SITE_DESCRIPTION = '记录技术、生活、阅读和长期想法的综合博客。';

export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${BASE_PATH}${normalizedPath}`;
}
