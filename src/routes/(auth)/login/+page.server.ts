import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword } from '$lib/server/models';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies, locals: { db, lucia } }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		const existingUser = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.username, username)
		});

		if (!existingUser) {
			return fail(400, { message: 'Invalid username or password' });
		}

		const validPassword = await verifyPassword(existingUser.hashedPassword, password);
		if (!validPassword) {
			return fail(400, { message: 'Invalid username or password' });
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
