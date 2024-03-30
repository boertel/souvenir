import { relations, sql } from 'drizzle-orm';
import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').notNull().primaryKey(),
	username: text('username').notNull().unique(),
	hashedPassword: text('hashed_password').notNull()
});

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
	grade: integer('grade'),
	repetition: integer('repetition').default(0),
	interval: integer('interval').default(0),
	efactor: integer('efactor').default(2.5),
	reviewAt: integer('review_at'),
	pinnedAt: integer('pinned_at'),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(datetime('now'))`),
	updatedAt: integer('updated_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

export type Entry = typeof entry.$inferSelect & { children?: Entry[]; html?: string }; // return type when queried
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
	entry
};

export const tables = {
	session: 'session',
	user: 'user',
	entry: 'entry'
};
