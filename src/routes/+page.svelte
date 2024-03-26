<script lang="ts">
	import { browser } from '$app/environment';
	import { slide } from 'svelte/transition';
	import { nanoid } from 'nanoid';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { dayjs } from '$lib/dayjs';
	import { derived } from 'svelte/store';
	import { entries, addEntry } from '$lib/store';
	import type { PageData } from './$types';
	import Editor from '$lib/Editor.svelte';
	import Entry from '$lib/Entry.svelte';

	export let data: PageData;

	let form: HTMLFormElement;
	entries.set(data.entries);

	import { beforeUpdate, afterUpdate } from 'svelte';

	let autoscroll = false;

	/*
	beforeUpdate(() => {
		const div = document.scrollingElement;
		if (div) {
			const scrollableDistance = div.scrollHeight - div.offsetHeight;
			console.log({
				scrollHeight: div.scrollHeight,
				offsetHeight: div.offsetHeight,
				scrollableDistance,
				scrollTop: div.scrollTop
			});
			//autoscroll = div.scrollTop > scrollableDistance - 80;
			autoscroll = true;
		}
	});

	afterUpdate(() => {
		const div = document.scrollingElement;
		console.log(div.scrollHeight, autoscroll);
		if (autoscroll) {
			div.scrollTo(0, div.scrollHeight - 80);
		}
	});
  */

	export function onkeydown(evt: CustomEvent) {
		const { key, metaKey } = evt.detail;
		if (key === 'Enter' && metaKey) {
			evt.preventDefault();
			form.requestSubmit();
		}
	}

	let numberOfEntries = derived(entries, ($entries) => $entries.length);

	let currentIndex: number | null = null;

	export function onWindowKeyDown(evt: KeyboardEvent) {
		if (evt.target.conentEditable) {
			return;
		}
		if (evt.key === 'ArrowDown') {
			currentIndex = Math.max(0, currentIndex - 1);
		} else if (evt.key === 'ArrowUp') {
			currentIndex = Math.min($entries.length, currentIndex + 1);
		} else if (evt.key === 'Escape') {
			currentIndex = null;
		}
	}
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<main
	class="mx-auto grid min-h-full w-full max-w-screen-lg grid-cols-[1fr_2fr_2fr_1fr] grid-rows-[min-content_1fr] px-2 md:px-6"
>
	{#if browser}
		<ul class={cn('col-span-4 grid grid-cols-subgrid py-4 transition-opacity duration-700')}>
			{#each $entries as entry, idx (entry.id)}
				{@const isSame = dayjs(entry.createdAt).isSame($entries[idx - 1]?.createdAt, 'date')}
				{@const isFocus =
					currentIndex !== null ? idx === $numberOfEntries - currentIndex - 1 : false}
				<li
					transition:slide
					class={cn(
						'group col-span-4 my-2 grid grid-cols-subgrid gap-1 md:gap-2',
						'first:border-0',
						'last:mb-8',
						'border-primary'
					)}
				>
					<Entry {entry} {isSame} {isFocus} />
				</li>
			{/each}
		</ul>
	{/if}

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
		class={cn(
			'flex flex-col-reverse',
			'col-span-4 md:col-span-2 md:col-start-2',
			'sticky bottom-0 z-10 bg-background py-4',
			'before:absolute before:bottom-full before:left-0 before:right-0 before:h-[40px] before:bg-gradient-to-t before:from-background before:to-transparent'
		)}
	>
		<div class="rounded-md border border-stone-600">
			<Editor on:keydown={onkeydown} class="px-4 py-2" />
		</div>
	</form>
</main>
