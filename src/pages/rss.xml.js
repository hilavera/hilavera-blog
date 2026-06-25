import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { BASE_PATH, SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	const site = new URL(`${BASE_PATH}/`, context.site);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site,
		items: posts.map((post) => ({
			...post.data,
			link: `blog/${post.id}/`,
		})),
	});
}
