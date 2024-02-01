import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	email: text('email').notNull().unique()
});

export const account = sqliteTable(
	'account',
	{
		id: text('id').notNull().primaryKey(),
		provider: text('provider').notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		expiresAt: integer('expires_at'),
		tokenType: text('token_type'),
		scope: text('scope'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id)
	},
	(t) => ({
		unique: unique().on(t.provider, t.providerAccountId)
	})
);

export const session = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at').notNull()
});

export const schema = {
	session,
	user,
	account
};
