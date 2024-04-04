import { nanoid } from 'nanoid';
import { and, eq, sql, desc, asc } from 'drizzle-orm';
import { schema, type Entry, type NewEntry } from './db/schema';
import { generateId } from 'lucia';
import { markdownToHtml } from '$lib/markdown';
import { supermemo } from 'supermemo';

export async function requireEntry(db, entryId: string, userId: string): Promise<Entry> {
	const entry = await db.query.entry.findFirst({
		where: and(eq(schema.entry.id, entryId), eq(schema.entry.userId, userId))
	});

	if (!entry) {
		throw new Error('Entry not found');
	}

	return entry;
}

export async function createEntry(
	db,
	{ id, content, userId, parentId }: Pick<NewEntry, 'id' | 'content' | 'userId' | 'parentId'>
): Promise<Entry> {
	const data = {
		id,
		content,
		parentId,
		userId,
		nextReviewAt: sql`datetime('now', '+7 days')`
	};
	const entries = await db.insert(schema.entry).values(data).returning();
	return entries[0];
}

async function generateHtml(entriesWithoutHtml: Entry[]): Promise<Entry[]> {
	const promises = entriesWithoutHtml.map(renderHtml);
	const entries = await Promise.all(promises);

	return entries;
}

async function findChildren(entries: Entry[]): Promise<Entry[]> {
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

export async function findEntriesToReview(db, userId: string): Promise<Entry[]> {
	const entriesWithoutHtml = await db.query.entry.findMany({
		where: and(eq(schema.entry.userId, userId), sql`next_review_at <= datetime('now')`),
		orderBy: desc(schema.entry.nextReviewAt),
		with: { practices: { orderBy: desc(schema.practice.createdAt), limit: 1 } }
	});

	const entries = await generateHtml(entriesWithoutHtml);
	return await findChildren(entries);
}

export async function findEntries(db, userId: string): Promise<Entry[]> {
	const entriesWithoutHtml = await db.query.entry.findMany({
		where: and(eq(schema.entry.userId, userId)),
		orderBy: asc(schema.entry.createdAt)
	});

	const entries = await generateHtml(entriesWithoutHtml);
	return await findChildren(entries);
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
	db,
	entryId: string,
	userId: string,
	{ content }: { content: string }
): Promise<Entry> {
	await requireEntry(db, entryId, userId);

	const newEntry = await createEntry(db, {
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

export async function practiceEntry(db, entryId: string, userId: string, grade: number) {
	const entry = await requireEntry(db, entryId, userId);
	const { interval, repetition, efactor } = supermemo(entry, grade);

	await db.insert(schema.practice).values({
		id: nanoid(),
		grade,
		entryId
	});

	await db
		.update(schema.entry)
		.set({
			repetition,
			interval,
			efactor,
			nextReviewAt: sql`datetime('now', '+' || ${interval} || ' days')`
		})
		.where(and(eq(schema.entry.id, entryId), eq(schema.entry.userId, userId)));
}

export async function removeEntry(db, entryId: string, userId: string): Promise<void> {
	await db
		.delete(schema.entry)
		.where(and(eq(schema.entry.id, entryId), eq(schema.entry.userId, userId)));
}

export async function togglePinEntry(db, entryId: string, userId: string): Promise<void> {
	const entry = await requireEntry(db, entryId, userId);

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

export async function createUser(
	db,
	{ username, password }: { username: string; password: string }
) {
	const userId = generateId(15);
	const hashedPassword = await digestPassword(password);
	await db.insert(schema.user).values({ id: userId, username, hashedPassword }).returning();
	return {
		id: userId,
		username
	};
}

async function digestPassword(raw: string): Promise<string> {
	const data = new TextEncoder().encode(raw);
	const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, data);
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
	return hashHex;
}

export async function verifyPassword(hashPassword: string, rawPassword: string): Promise<boolean> {
	const hashed = await digestPassword(rawPassword);
	return hashed === hashPassword;
}
