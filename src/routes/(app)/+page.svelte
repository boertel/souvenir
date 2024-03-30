<script lang="ts">
	import { browser } from '$app/environment';
	import { nanoid } from 'nanoid';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { dayjs } from '$lib/dayjs';
	import { entries, addEntry } from '$lib/store';
	import type { PageData } from './$types';
	import Editor from '$lib/Editor.svelte';
	import Entries from '$lib/Entries.svelte';

	export let data: PageData;

	let form: HTMLFormElement;
	entries.set(data.entries);

	export function onkeydown(evt: CustomEvent) {
		const { key, metaKey } = evt.detail;
		if (key === 'Enter' && metaKey) {
			evt.preventDefault();
			form.requestSubmit();
		}
	}

	let currentIndex: number | null = null;

	export function onWindowKeyDown(evt: KeyboardEvent) {
		if (evt.target.contentEditable === 'true') {
			return;
		}
		if (['ArrowUp', 'k'].includes(evt.key)) {
			currentIndex = currentIndex === null ? 0 : Math.min($entries.length - 1, currentIndex + 1);
		} else if (['ArrowDown', 'j'].includes(evt.key)) {
			currentIndex = Math.max(0, currentIndex - 1);
		} else if (evt.key === 'Escape') {
			currentIndex = null;
		}
	}
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<main
	class="mx-auto grid min-h-full w-full max-w-screen-lg flex-1 grid-cols-[1fr_2fr_2fr_1fr] grid-rows-[1fr_min-content] px-2 md:px-6"
>
	<Entries {currentIndex} {entries} />

	<section
		class={cn(
			'col-span-4 grid grid-cols-subgrid gap-1 md:gap-2',
			'sticky bottom-0 z-10 bg-background py-4',
			'before:absolute before:bottom-full before:left-0 before:right-0 before:h-[40px] before:bg-gradient-to-t before:from-background before:to-transparent'
		)}
	>
		<time
			class="col-span-4 flex items-center font-mono text-xs text-muted md:col-span-1 md:flex-row-reverse"
			>{dayjs().format('HH:mm')}</time
		>
		<form
			bind:this={form}
			data-sveltekit-noscroll
			use:enhance={({ formData }) => {
				const newEntry = {
					id: nanoid(),
					createdAt: new Date(),
					updatedAt: new Date(),
					content: formData.get('content')
				};

				formData.set('id', newEntry.id);

				addEntry(newEntry);

				return async ({ result, update }) => {
					// TODO invalidate entry if save got rejected
				};
			}}
			method="POST"
			action="?/create"
			class={cn('col-span-4 md:col-span-2')}
		>
			<div class="min-h-[40px] rounded-md border border-stone-600">
				<Editor on:keydown={onkeydown} class="px-4 py-2" />
			</div>
		</form>
	</section>
</main>
