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

export const load: PageServerLoad = async ({ locals, platform: { db } }) => {
	if (!locals.user?.id) {
		return redirect(302, '/login');
	}

	const entries = await findEntries(db, locals.user.id);

	return {
		user: locals.user,
		entries
	};
};

export const actions = {
	task: async ({ request, platform: { db }, locals }) => {
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
		const entry = await requireEntry(db, entryId, locals.user.id);

		const content = String(
			await markdownToAst()
				.use(checkbox(checks))
				.use(remarkStringify, { bullet: '-' })
				.process(entry.content)
		);

		await updateEntry(db, entryId, locals.user.id, { content });
	},
	pin: async ({ request, locals, platform: { db } }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const entryId = data.get('id') as string;

		if (entryId) {
			await togglePinEntry(db, entryId, locals.user.id);
		}
	},
	remove: async ({ request, locals, platform: { db } }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const entryId = data.get('id') as string;

		if (entryId) {
			await removeEntry(db, entryId, locals.user.id);
		}
	},
	edit: async ({ request, locals, platform: { db } }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const content = data.get('content') as string;
		const entryId = data.get('id') as string;

		if (content) {
			await updateEntry(db, entryId, locals.user.id, {
				content
			});
		}
	},
	create: async ({ request, locals, platform: { db } }) => {
		if (!locals.user?.id) {
			return fail(401);
		}

		const data = await request.formData();
		const content = data.get('content') as string;
		const id = data.get('id') as string;

		if (content) {
			const entry = await createEntry(db, {
				id,
				content,
				userId: locals.user.id
			});

			return { entry };
		}
	}
} satisfies Actions;
