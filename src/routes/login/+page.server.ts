import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/db';
import { Argon2id } from 'oslo/password';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		const existingUser = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.username, username)
		});

		if (!existingUser) {
			return fail(400, { message: 'Invalid username or password' });
		}

		const validPassword = new Argon2id().verify(existingUser.hashedPassword, password);
		if (!validPassword) {
			return fail(400, { message: 'Invalid username or password' });
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
