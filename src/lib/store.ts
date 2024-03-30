import { writable } from 'svelte/store';
import { markdownToHtml } from './markdown';

export const entries = writable([]);

export async function addEntry(entry) {
	const newEntry = {
		...entry,
		grade: null,
		html: await markdownToHtml(entry.content)
	};
	entries.update((prev) => [...prev, newEntry]);
}

export function removeEntry(id: string) {
	entries.update((prev) => prev.filter((entry) => entry.id !== id));
}

export async function updateEntry(
	id: string,
	{ content, grade }: { content?: string; grade?: number }
) {
	const update: { content?: string; grade?: number; html?: string } = {};
	if (content !== null) {
		update.content = content;
		if (content) {
			update.html = await markdownToHtml(content);
		}
	}
	if (grade !== null) {
		update.grade = grade;
	}
	entries.update((prev) =>
		prev.map((entry) => {
			if (entry.id === id) {
				return { ...entry, updatedAt: new Date(), ...update };
			} else {
				return entry;
			}
		})
	);
}
