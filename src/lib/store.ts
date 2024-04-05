import { writable } from 'svelte/store';
import { dayjs } from '$lib/dayjs';
import { markdownToHtml } from './markdown';

export const entries = writable([]);

export const entriesToReview = writable([]);

export async function addEntry(entry) {
	const newEntry = {
		...entry,
		html: String(await markdownToHtml(entry.content))
	};
	entries.update((prev) => [...prev, newEntry]);
}

export function removeEntry(id: string) {
	entries.update((prev) => prev.filter((entry) => entry.id !== id));
}

export async function updateEntry(id: string, { content }: { content?: string }) {
	const update: { updatedAt: string; content?: string; html?: string } = {
		updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss')
	};
	if (content !== null) {
		update.content = content;
		if (content) {
			update.html = await markdownToHtml(content);
		}
	}

	entries.update((prev) =>
		prev.map((entry) => {
			if (entry.id === id) {
				return { ...entry, children: (entry.children || []).concat([entry]), ...update };
			} else {
				return entry;
			}
		})
	);
}
