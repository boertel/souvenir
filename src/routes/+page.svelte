<script lang="ts">
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { isSameDay } from 'date-fns';
	import type { PageData } from './$types';
	import Editor from '$lib/Editor.svelte';
	import Entry from '$lib/Entry.svelte';

	export let data: PageData;
	let form: HTMLFormElement;

	export function onkeydown(evt: CustomEvent) {
		const { key, metaKey } = evt.detail;
		if (key === 'Enter' && metaKey) {
			evt.preventDefault();
			form.submit();
		}
	}

	export function onWindowKeyDown(evt: KeyboardEvent) {}
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<main
	class="mx-auto grid min-h-full w-full max-w-screen-lg grid-cols-[1fr_4fr_1fr] grid-rows-[min-content_1fr] px-6"
>
	<ul class="col-span-3 grid grid-cols-subgrid gap-y-4 py-4">
		{#each data.entries as entry, idx (entry.id)}
			{@const isSame = isSameDay(entry.createdAt, data.entries[idx - 1]?.createdAt)}
			<Entry {entry} {isSame} />
		{/each}
	</ul>

	<form
		bind:this={form}
		use:enhance
		method="POST"
		action="?/create"
		class={cn(
			'sticky bottom-0 z-10 col-start-2 col-end-2 bg-background px-1 py-4',
			'before:absolute before:bottom-full before:left-0 before:right-0 before:h-[40px] before:bg-gradient-to-t before:from-background before:to-transparent'
		)}
	>
		<div class="rounded-md border border-stone-600 px-4 py-2">
			<Editor on:keydown={onkeydown} />
		</div>
	</form>
</main>
