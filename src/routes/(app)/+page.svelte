<script lang="ts">
	import { nanoid } from 'nanoid';
	import { enhance } from '$app/forms';
	import { cn } from '$lib/utils';
	import { dayjs } from '$lib/dayjs';
	import { entries, entriesToReview, addEntry } from '$lib/store';
	import type { PageData } from './$types';
	import Editor from '$lib/Editor.svelte';
	import Entries from '$lib/Entries.svelte';
	import { Drawer } from 'vaul-svelte';
	import Now from '$lib/Now.svelte';
	import { derived } from 'svelte/store';
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import type { EditorView } from '@codemirror/view';

	export let data: PageData;

	async function scrollToBottom(behavior?: ScrollBehavior) {
		if (browser) {
			let scrollingElement = document.scrollingElement;
			if (scrollingElement) {
				await tick();
				scrollingElement.scrollTo({
					left: 0,
					top: scrollingElement.scrollHeight,
					behavior
				});
			}
		}
	}

	onMount(scrollToBottom);

	let form: HTMLFormElement;
	entries.set(data.entries);
	entriesToReview.set(data.entriesToReview);

	export function onkeydown(evt: CustomEvent) {
		const { key, metaKey } = evt.detail;
		if (key === 'Enter' && metaKey) {
			evt.preventDefault();
			form.requestSubmit();
		}
	}

	let currentIndex: number | null = null;

	let editorView: EditorView;

	export function onWindowKeyDown(evt: KeyboardEvent) {
		if (evt.target.contentEditable === 'true') {
			return;
		}
		if (['ArrowUp', 'k'].includes(evt.key)) {
			evt.preventDefault();
			currentIndex = currentIndex === null ? 0 : Math.min($entries.length - 1, currentIndex + 1);
		} else if (['ArrowDown', 'j'].includes(evt.key)) {
			evt.preventDefault();
			currentIndex = Math.max(0, currentIndex - 1);
		} else if (evt.key === 'i') {
			currentIndex = null;
			evt.preventDefault();
			editorView.focus();
		} else if (evt.key === 'Escape') {
			currentIndex = null;
		}
	}

	let numberOfEntriesToReview = derived(
		entriesToReview,
		($entriesToReview) => $entriesToReview.length
	);

	$: $entries, scrollToBottom('smooth');

	let showButton = false;
</script>

<svelte:window on:keydown={onWindowKeyDown} />

<main
	class="mx-auto grid min-h-full w-full max-w-screen-lg flex-1 grid-cols-[1fr_2fr_2fr_1fr] grid-rows-[1fr_min-content] px-2 md:px-6"
>
	<Entries
		{currentIndex}
		{entries}
		isReviewable={false}
		on:intersect={({ detail: { isIntersecting } }) => {
			showButton = !isIntersecting;
		}}
	/>

	<section
		class={cn(
			'col-span-4 grid grid-cols-subgrid gap-1 md:gap-2',
			'sticky bottom-0 z-10 bg-background py-4',
			'before:absolute before:bottom-full before:left-0 before:right-0 before:h-[40px] before:bg-gradient-to-t before:from-background before:to-transparent'
		)}
	>
		<Now
			class={cn(
				'font-mono text-xs text-muted',
				'col-span-2 row-start-1 flex items-baseline py-0 md:col-span-1 md:row-start-auto md:flex-row-reverse md:py-2'
			)}
		/>
		<form
			bind:this={form}
			data-sveltekit-noscroll
			use:enhance={({ formData }) => {
				const newEntry = {
					id: nanoid(),
					createdAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
					updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
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
			<div class="relative min-h-[42px] rounded-md border border-stone-600">
				<div
					class={cn(
						'absolute bottom-full left-0 right-0 flex justify-center transition-opacity',
						showButton ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
					)}
				>
					<button
						type="button"
						on:click={() => {
							if (document.scrollingElement) {
								document.scrollingElement.scrollTo({
									top: document.scrollingElement.scrollHeight,
									left: 0,
									behavior: 'smooth'
								});
							}
						}}
						class="mb-4 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground outline outline-1 outline-offset-1 outline-primary/0 transition-all hover:outline-primary/90"
						>Back to most recent</button
					>
				</div>
				<Editor bind:view={editorView} on:keydown={onkeydown} class="px-4 py-2" />
				<div class="absolute bottom-0 right-0 top-0 flex items-center px-4 text-xs text-muted">
					&#8984; + Enter
				</div>
			</div>
		</form>

		<div
			class="col-span-2 row-start-1 flex items-start justify-self-end py-0 md:col-span-1 md:row-start-auto md:justify-self-auto md:py-2"
		>
			{#if $numberOfEntriesToReview > 0}
				<Drawer.Root>
					<Drawer.Trigger class="text-xs text-muted outline-none hover:underline"
						>{$numberOfEntriesToReview}
						{$numberOfEntriesToReview === 1 ? 'entry' : 'entries'} to review</Drawer.Trigger
					>
					<Drawer.Portal>
						<Drawer.Overlay class="fixed inset-0 bg-black/40" />
						<Drawer.Content
							class="mt-18 fixed bottom-0 left-0 right-0 z-20 mx-2 flex h-[98%] flex-col rounded-t-[10px] bg-background px-2 md:mx-6 md:px-6"
						>
							<Entries entries={entriesToReview} isReviewable={true} class="h-full overflow-auto" />
							<div class="sticky bottom-0 left-0 right-0 px-2 py-4 md:px-6">
								<Drawer.Close>Done</Drawer.Close>
							</div>
						</Drawer.Content>
						<Drawer.Overlay />
					</Drawer.Portal>
				</Drawer.Root>
			{/if}
		</div>
	</section>
</main>
