// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'hilavera 的博客';
export const SITE_DESCRIPTION = '一个入门开发者的学习路线、项目复盘、踩坑记录和工具配置日志。';

export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${BASE_PATH}${normalizedPath}`;
}
