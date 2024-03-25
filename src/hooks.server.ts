import { initializeLucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import { schema } from '$lib/server/db/schema';

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.platform) {
		return resolve(event);
	}

	const lucia = initializeLucia(event.platform.env.DB);
	const db = drizzle(event.platform.env.DB, { schema });

	event.locals.lucia = lucia;
	event.locals.db = db;

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
