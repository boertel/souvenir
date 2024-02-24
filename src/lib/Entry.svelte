<script lang="ts">
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import Editor from '$lib/Editor.svelte';
	import RepetitionIcon from '$icons/Repetition.svelte';
	import EditIcon from '$icons/EditIcon.svelte';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
	import PinIcon from '$icons/PinIcon.svelte';
	import { format } from 'date-fns';
	import EntryActionButton from './EntryActionButton.svelte';
	import EntryContent from './EntryContent.svelte';

	function onWindowKeyDown(evt) {
		if (evt.key === 'Escape' && isEditing) {
			isEditing = false;
		}
	}

	let form: HTMLFormElement;

	export function onkeydown(evt: CustomEvent) {
		const { key, metaKey } = evt.detail;
		if (key === 'Enter' && metaKey) {
			evt.preventDefault();
			form.submit();
		}
	}

	export let entry: {
		id: string;
		content: string;
		createdAt: Date;
		parentId?: string;
		childId?: string;
	};
	export let isSame: boolean;

	let isEditing = false;
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<li
	class={cn(
		'group col-span-3 grid grid-cols-subgrid gap-2',
		!isSame ? 'border-t border-stone-600 pt-4' : null,
		'first:border-0',
		'last:mb-8'
	)}
>
	<div class="stify-end col-start-1 mt-1 py-2 text-right text-sm text-stone-500">
		{#if !isSame}
			<time class="text-right">{format(entry.createdAt, 'MMM do')}</time>
			<span class="opacity-0 transition-all group-hover:opacity-100"> at </span>
		{/if}
		<time class="opacity-0 transition-all group-hover:opacity-100"
			>{format(entry.createdAt, 'HH:mm')}</time
		>
	</div>
	<div
		class={cn(
			'col-start-2 col-end-2 rounded-md border border-transparent',
			isEditing && 'border-stone-500',
			'relative',
			entry.parentId &&
				'before:absolute before:bottom-0 before:left-[6px] before:right-[6px] before:top-0 before:z-[-1] before:translate-y-[3px] before:rounded-md before:border before:border-stone-400 before:border-opacity-30 before:bg-background',
			entry.parentId &&
				'after:absolute after:bottom-0 after:left-[12px] after:right-[12px] after:top-0 after:z-[-2] after:translate-y-[6px] after:rounded-md after:border after:border-stone-400 after:border-opacity-30 after:bg-background'
		)}
	>
		<div class="rounded-md bg-[#262625] px-4 py-2">
			{#if isEditing}
				<form use:enhance method="POST" action="?/edit" bind:this={form} data-sveltekit-noscroll>
					<input type="hidden" name="id" value={entry.id} />
					<Editor defaultValue={entry.content} on:keydown={onkeydown} />
				</form>
			{:else}
				<EntryContent entryId={entry.id} content={entry.content} />
			{/if}
		</div>
	</div>
	<aside
		class={cn(
			'col-start-3 mt-[1px]',
			'w-min',
			'grid auto-rows-min grid-cols-[repeat(3,_1fr)] items-center gap-1',
			'text-stone-500 opacity-0 transition-opacity group-hover:opacity-100',
			isEditing && 'opacity-100'
		)}
	>
		<form method="POST" action="?/pin" use:enhance class="flex">
			<input type="hidden" name="id" value={entry.id} />
			<EntryActionButton>
				<PinIcon />
			</EntryActionButton>
		</form>
		<EntryActionButton on:click={() => (isEditing = !isEditing)}>
			<EditIcon />
		</EntryActionButton>
		<form method="POST" action="?/remove" use:enhance class="flex">
			<input type="hidden" name="id" value={entry.id} />
			<EntryActionButton style="--current-color: var(--destructive)">
				<DeleteIcon />
			</EntryActionButton>
		</form>

		<!--EntryActionButton>
			<RepetitionIcon />
		</EntryActionButton-->
	</aside>
</li>

<style>
	:global(code) {
		position: relative;
		z-index: 1;
		margin: 0 0.4em;
		@apply before:absolute before:bottom-[-3px] before:left-[-6px] before:right-[-6px] before:top-[-3px] before:z-[-1] before:rounded-sm before:bg-black before:bg-opacity-80;
		font-size: 0.75em;
	}
	:global(a) {
		text-decoration: underline;
	}
	:global(ol) {
		list-style: decimal;
		list-style-position: inside;
	}
	:global(blockquote) {
		@apply my-2 border-l-[3px] border-stone-500 pl-2 text-stone-400;
	}
	:global(input[type='checkbox']) {
		vertical-align: middle;
		@apply accent-primary;
	}
</style>
