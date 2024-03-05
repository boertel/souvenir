import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { db } from './db/db';
import { schema } from './db/schema';

const adapter = new DrizzleSQLiteAdapter(db, schema.session, schema.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<typeof schema.user, 'id'>;
	}
}
