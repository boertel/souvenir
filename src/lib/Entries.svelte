<script lang="ts">
	import { slide } from 'svelte/transition';
	import { derived } from 'svelte/store';
	import { cn } from '$lib/utils';
	import { dayjs } from '$lib/dayjs';
	import Entry from '$lib/Entry.svelte';

	export let currentIndex: number | null;
	export let entries;

	let numberOfEntries = derived(entries, ($entries) => $entries.length);
</script>

<div class="col-span-4 grid grid-cols-subgrid grid-rows-[min-content]">
	<ul class={cn('col-span-4 grid grid-cols-subgrid py-4 transition-opacity duration-700')}>
		{#each $entries as entry, idx (entry.id)}
			{@const isSame = dayjs(entry.createdAt).isSame($entries[idx - 1]?.createdAt, 'date')}
			{@const isFocus = currentIndex !== null ? idx === $numberOfEntries - currentIndex - 1 : false}
			<li
				transition:slide
				class={cn(
					'group col-span-4 my-2 grid grid-cols-subgrid gap-1 md:gap-2',
					'first:border-0',
					'last:mb-8',
					'border-primary'
				)}
			>
				<Entry isReviewable={false} {entry} {isSame} {isFocus} />
			</li>
		{/each}
	</ul>
</div>
