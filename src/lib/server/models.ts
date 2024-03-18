import { nanoid } from 'nanoid';
import { db } from './db/db';
import { and, eq, sql } from 'drizzle-orm';
import { schema, type Entry, type NewEntry } from './db/schema';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { markdownToHtml } from '$lib/markdown';

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
	id,
	content,
	userId,
	parentId
}: Pick<NewEntry, 'id' | 'content' | 'userId' | 'parentId'>): Promise<Entry> {
	const data = {
		id,
		content,
		parentId,
		userId
	};
	const entries = await db.insert(schema.entry).values(data).returning();
	return entries[0];
}

export async function findEntries(userId: string): Promise<Entry[]> {
	const entriesWithoutHtml = await db.query.entry.findMany({
		where: and(eq(schema.entry.userId, userId))
	});

	const promises = entriesWithoutHtml.map(renderHtml);
	const entries = await Promise.all(promises);

	const entriesById: Map<string, Entry> = new Map(entries.map((entry) => [entry.id, entry]));

	const entriesWithChildren: Entry[] = [];
	entries.forEach((entry) => {
		if (entry.childId === null) {
			findChild(entriesById, entry, entry);
			entriesWithChildren.push(entry);
		}
	});

	return entriesWithChildren;
}

async function renderHtml(entry: Entry): Promise<Entry & { html: string }> {
	return {
		...entry,
		html: String(await markdownToHtml(entry.content))
	};
}

function findChild(entriesById: Map<string, Entry>, root: Entry, entry: Entry) {
	if (entry.parentId) {
		const child = entriesById.get(entry.parentId);
		if (child) {
			findChild(entriesById, root, child);
			root.children ??= [];
			root.children.push(child);
		}
	}
}

export async function updateEntry(
	entryId: string,
	userId: string,
	{ content }: { content: string }
): Promise<Entry> {
	await requireEntry(entryId, userId);

	const newEntry = await createEntry({
		id: nanoid(),
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

export async function createUser({ username, password }: { username: string; password: string }) {
	const userId = generateId(15);
	const hashedPassword = await new Argon2id().hash(password);
	await db.insert(schema.user).values({ id: userId, username, hashedPassword }).returning();
	return {
		id: userId,
		username
	};
}
