import { fail, redirect } from '@sveltejs/kit';
import { markdownToAst, checkbox, markdownToHtml } from '$lib/markdown';
import remarkStringify from 'remark-stringify';

import type { Actions, PageServerLoad } from './$types';
import {
	togglePinEntry,
	removeEntry,
	createEntry,
	updateEntry,
	requireEntry,
	findEntries
} from '$lib/server/models';
import type { Entry } from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user?.id) {
		return redirect(302, '/auth');
	}

	const entries = await findEntries(event.locals.user.id);

	async function renderHtml(entry: Entry): Promise<Entry & { html: string }> {
		return {
			...entry,
			html: String(await markdownToHtml(entry.content))
		};
	}

	const promises = entries.map(renderHtml);

	return {
		user: event.locals.user,
		entries: await Promise.all(promises)
	};
};

export const actions = {
	task: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const { id, ...tasks } = Object.fromEntries(data.entries());

		const checks = {};
		for (const [key, value] of Object.entries(tasks)) {
			checks[parseInt(key, 10)] = value === 'on';
		}

		const entryId = id as string;
		const entry = await requireEntry(entryId, locals.user.id);

		const content = String(
			await markdownToAst()
				.use(checkbox(checks))
				.use(remarkStringify, { bullet: '-' })
				.process(entry.content)
		);

		await updateEntry(entryId, locals.user.id, { content });
	},
	pin: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const entryId = data.get('id') as string;

		if (entryId) {
			await togglePinEntry(entryId, locals.user.id);
		}
	},
	remove: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const entryId = data.get('id') as string;

		if (entryId) {
			await removeEntry(entryId, locals.user.id);
		}
	},
	edit: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const content = data.get('content') as string;
		const entryId = data.get('id') as string;

		if (content) {
			await updateEntry(entryId, locals.user.id, {
				content
			});
		}
	},
	create: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const content = data.get('content') as string;
		const id = data.get('id') as string;

		if (content) {
			const entry = await createEntry({
				id,
				content,
				userId: locals.user.id
			});

			return { entry };
		}
	}
} satisfies Actions;
