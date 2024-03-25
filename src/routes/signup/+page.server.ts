import { redirect } from '@sveltejs/kit';
import { createUser } from '$lib/server/models';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies, platform: { lucia, db } }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		const { id: userId } = await createUser(db, { username, password });

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
