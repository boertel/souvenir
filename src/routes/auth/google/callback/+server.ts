import { google, lucia } from '$lib/server/auth';
import { db } from '$lib/server/db/db';
import { schema } from '$lib/server/db/schema';
import { OAuth2RequestError } from 'arctic';
import { generateId } from 'lucia';

import type { Cookies, RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const storedCodeVerifier = event.cookies.get('code_verifier') ?? null;
	if (!storedCodeVerifier || !code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

		const googleUserResponse = await fetch(
			'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
			{
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`
				}
			}
		);
		const googleUser: GoogleUser = await googleUserResponse.json();
		console.log(tokens, googleUser);

		const existingAccount = await db.query.account.findFirst({
			where: (account, { eq, and }) =>
				and(eq(account.provider, 'google'), eq(account.providerAccountId, googleUser.id))
		});

		if (existingAccount) {
			await createSession(event.cookies, existingAccount.userId);
		} else {
			const userId = await db.transaction(async (tx) => {
				const userId = generateId(15);
				await tx.insert(schema.user).values({
					id: userId,
					email: googleUser.email
				});

				await tx.insert(schema.account).values({
					id: generateId(15),
					provider: 'google',
					providerAccountId: googleUser.id,
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					expiresAt: tokens.accessTokenExpiresAt.valueOf(),
					userId
				});
				return userId;
			});
			await createSession(event.cookies, userId);
		}
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		console.error(e);
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

async function createSession(cookies: Cookies, userId: string) {
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
}

interface GoogleUser {
	id: string;
	email_verified: boolean;
	given_name: string;
	name: string;
	email: string;
	picture: string;
}
