import { Lucia } from 'lucia';
import { D1Adapter } from '@lucia-auth/adapter-sqlite';
import type { D1Database } from '@cloudflare/workers-types';

import { dev } from '$app/environment';
import { schema, tables } from './db/schema';

export function initializeLucia(D1: D1Database) {
	const adapter = new D1Adapter(D1, tables);
	return new Lucia(adapter, {
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
}

declare module 'lucia' {
	interface Register {
		Auth: ReturnType<typeof initializeLucia>;
		DatabaseUserAttributes: Omit<typeof schema.user, 'id'>;
	}
}
