import { nanoid } from 'nanoid';
import { db } from './db/db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { schema, type Entry, type NewEntry } from './db/schema';

export async function requireEntry(entryId: string, userId: string): Promise<Entry> {
	const entry = await db.query.entry.findFirst({
		where: and(eq(schema.entry.id, entryId), eq(schema.entry.userId, userId))
	});

	if (!entry) {
		throw new Error('Entry not found');
	}

	return entry;
}

export async function createEntry({
	content,
	userId,
	parentId
}: Pick<NewEntry, 'content' | 'userId' | 'parentId'>): Promise<Entry> {
	const entryId = nanoid();
	const data = {
		id: entryId,
		content,
		parentId,
		userId
	};
	const entries = await db.insert(schema.entry).values(data).returning();
	return entries[0];
}

export async function findEntries(userId: string): Promise<Entry[]> {
	return db.query.entry.findMany({
		where: and(eq(schema.entry.userId, userId), isNull(schema.entry.childId))
	});
}

export async function updateEntry(
	entryId: string,
	userId: string,
	{ content }: { content: string }
): Promise<Entry> {
	await requireEntry(entryId, userId);

	const newEntry = await createEntry({
		content,
		userId,
		parentId: entryId
	});

	await db
		.update(schema.entry)
		.set({ updatedAt: sql`datetime('now')`, childId: newEntry.id })
		.where(and(eq(schema.entry.id, entryId)));

	return newEntry;
}

export async function removeEntry(entryId: string, userId: string): Promise<void> {
	await db
		.delete(schema.entry)
		.where(and(eq(schema.entry.id, entryId), eq(schema.entry.userId, userId)));
}

export async function togglePinEntry(entryId: string, userId: string): Promise<void> {
	const entry = await requireEntry(entryId, userId);

	const data: { updatedAt: any; pinnedAt?: any } = { updatedAt: sql`datetime('now')` };
	if (!entry.pinnedAt) {
		data.pinnedAt = sql`datetime('now')`;
	} else {
		data.pinnedAt = null;
	}

	await db
		.update(schema.entry)
		.set(data)
		.where(and(eq(schema.entry.id, entryId), eq(schema.entry.userId, userId)));
}
