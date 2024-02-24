import { relations, sql } from 'drizzle-orm';
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

export const entry = sqliteTable('entry', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	parentId: text('parent_id'),
	childId: text('child_id'),
	content: text('content').notNull(),
	pinnedAt: integer('pinned_at'),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: integer('updated_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

export type Entry = typeof entry.$inferSelect; // return type when queried
export type NewEntry = typeof entry.$inferInsert; // return type when queried

export const entryRelations = relations(entry, ({ one }) => ({
	parent: one(entry, {
		fields: [entry.parentId],
		references: [entry.id]
	}),
	child: one(entry, {
		fields: [entry.childId],
		references: [entry.id]
	})
}));

export const schema = {
	session,
	user,
	account,
	entry
};
