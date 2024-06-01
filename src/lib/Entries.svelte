<script lang="ts">
	import { derived } from 'svelte/store';
	import { cn } from '$lib/utils';
	import { dayjs } from '$lib/dayjs';
	import Entry from '$lib/Entry.svelte';

	export let currentIndex: number | null = null;
	export let entries;
	export let isReviewable: boolean;
	let className = '';
	export { className as class };

	let numberOfEntries = derived(entries, ($entries) => $entries.length);
</script>

{#if $numberOfEntries > 0}
	<section class={cn('col-span-4 grid grid-cols-subgrid grid-rows-[min-content]', className)}>
		<ul class={cn('col-span-4 grid grid-cols-subgrid py-4 transition-opacity duration-700')}>
			{#each $entries as entry, idx (entry.id)}
				{@const createdOnTheSameDay = dayjs(entry.createdAt).isSame(
					$entries[idx - 1]?.createdAt,
					'date'
				)}
				{@const isFocus =
					currentIndex !== null ? idx === $numberOfEntries - currentIndex - 1 : false}
				<Entry {isReviewable} {entry} {createdOnTheSameDay} {isFocus} />
			{/each}
		</ul>
	</section>
{/if}
