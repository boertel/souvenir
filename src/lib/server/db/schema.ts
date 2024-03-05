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

export type EntryWithChildren = Entry & { children: Entry[] };

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
