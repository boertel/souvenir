<script lang="ts">
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import Editor from '$lib/Editor.svelte';
	import ExpandIcon from '$icons/ExpandIcon.svelte';
	import EditIcon from '$icons/EditIcon.svelte';
	import DeleteIcon from '$icons/DeleteIcon.svelte';
	import PinIcon from '$icons/PinIcon.svelte';
	import { dayjs } from '$lib/dayjs';
	import EntryActionButton from './EntryActionButton.svelte';
	import EntryContent from './EntryContent.svelte';
	import { updateEntry, removeEntry } from '$lib/store';
	import type { Entry } from './server/db/schema';
	import MinimizeIcon from '$icons/MinimizeIcon.svelte';

	function onWindowKeyDown(evt) {
		if (evt.key === 'Escape' && isEditing) {
			isEditing = false;
		}
		if (isFocus && evt.key === 'e') {
			isEditing = true;
		}
	}

	let form: HTMLFormElement;

	export function onkeydown(evt: CustomEvent) {
		const { key, metaKey } = evt.detail;
		if (key === 'Enter' && metaKey) {
			evt.preventDefault();
			form.requestSubmit();
			isEditing = false;
		}
	}

	export let entry: Entry;
	export let isSame: boolean;
	export let isFocus: boolean;

	let isEditing = false;
	let showChildren = false;

	function formatCreatedAt(format: string): string {
		// TODO fix it
		let tz = 'America/Los_Angeles';
		return dayjs.utc(entry.createdAt).tz(tz).format(format);
	}
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<div class="col-start-1 py-2 text-right font-mono text-xs text-stone-500">
	{#if !isSame}
		<time class="text-right">{formatCreatedAt('MMM Do')}</time>
		<span class="opacity-0 transition-all group-hover:opacity-100"> at </span>
	{/if}
	<time class="opacity-0 transition-all group-hover:opacity-100">{formatCreatedAt('HH:mm')}</time>
</div>
<div class={cn('col-start-2 col-end-2', 'relative')}>
	<div
		class={cn(
			'rounded-md border border-transparent bg-[#262625] px-4 py-2',
			isFocus && 'border-primary',
			isEditing && 'border-stone-500'
		)}
		role="button"
		on:click={() => {
			if (!isEditing) {
				showChildren = !showChildren;
			}
		}}
	>
		{#if isEditing}
			<form
				method="POST"
				action="?/edit"
				use:enhance={({ formData }) => {
					updateEntry(entry.id, { content: formData.get('content') });
				}}
				bind:this={form}
				data-sveltekit-noscroll
			>
				<input type="hidden" name="id" value={entry.id} />
				<Editor defaultValue={entry.content} on:keydown={onkeydown} />
			</form>
		{:else}
			<EntryContent entryId={entry.id} html={entry.html} />
		{/if}
	</div>
	<ul class={cn('flex flex-col gap-2')}>
		{#each entry.children || [] as child, idx}
			<li
				class={cn(
					showChildren
						? 'rounded-md border border-transparent bg-[#262625] px-4 py-2 first:mt-2'
						: 'absolute inset-0 overflow-hidden rounded-md border border-stone-400 border-opacity-30 bg-[#202020]'
				)}
				style={showChildren
					? `transition-property: transform; transition-duration: .2s; transition-timing-function: ease-in-out;`
					: `transition-property: transform; transition-duration: .2s; transition-timing-function: ease-in-out; z-index: -${idx + 1}; transform: translateY(${(idx + 1) * 0.3}rem) scale(${1 - (idx + 1) * 0.02});`}
			>
				<EntryContent
					entryId={child.id}
					html={child.html}
					class={cn('transition-opacity', showChildren ? 'opacity-100' : 'opacity-0')}
				/>
			</li>
		{/each}
	</ul>
</div>
<aside
	class={cn(
		'col-start-3 py-2',
		'w-min',
		'grid auto-rows-min grid-cols-[repeat(3,_1fr)] items-center gap-1',
		'text-stone-500 opacity-0 transition-opacity group-hover:opacity-100',
		isEditing && 'opacity-100'
	)}
>
	<!--form method="POST" action="?/pin" use:enhance class="flex">
		<input type="hidden" name="id" value={entry.id} />
		<EntryActionButton>
			<PinIcon />
		</EntryActionButton>
	</form-->
	{#if entry.children}
		<EntryActionButton on:click={() => (showChildren = !showChildren)}>
			{#if showChildren}<MinimizeIcon />{:else}<ExpandIcon />{/if}
		</EntryActionButton>
	{/if}
	<EntryActionButton on:click={() => (isEditing = !isEditing)}>
		<EditIcon />
	</EntryActionButton>
	<form
		method="POST"
		action="?/remove"
		use:enhance={() => {
			removeEntry(entry.id);
		}}
		class="flex"
	>
		<input type="hidden" name="id" value={entry.id} />
		<EntryActionButton style="--current-color: var(--destructive)">
			<DeleteIcon />
		</EntryActionButton>
	</form>

	<!--EntryActionButton>
			<RepetitionIcon />
		</EntryActionButton-->
</aside>

<style>
	:global(pre) {
		margin: 0.4em 0;
		position: relative;
		z-index: 1;
	}
	:global(code) {
		position: relative;
		z-index: 1;
		margin: 0 0.4em;
		@apply before:absolute before:bottom-[-3px] before:left-[-6px] before:right-[-6px] before:top-[-3px] before:z-[-1] before:rounded-sm before:bg-black before:bg-opacity-80;
		font-size: 0.75em;
		white-space: pre;
	}
	:global(pre > code) {
		display: block;
		position: static;
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
