<script lang="ts">
	import { enhance } from '$app/forms';
	import GradeButton from './GradeButton.svelte';
	import MoodCheckIcon from '$icons/MoodCheckIcon.svelte';
	import MoodPuzzledIcon from '$icons/MoodPuzzledIcon.svelte';
	import MoodSickIcon from '$icons/MoodSickIcon.svelte';
	import MoodCryIcon from '$icons/MoodCryIcon.svelte';
	import { updateEntry } from '$lib/store';

	export let entryId: string;
	let grade: number | null = null;
</script>

<form
	method="POST"
	use:enhance={({ formData }) => {
		grade = parseInt(formData.get('grade'), 10);
	}}
	action="?/practice"
	class="mt-2 grid grid-cols-[min-content_min-content_min-content_min-content] justify-center gap-x-2 border-t border-border pt-1 text-sm"
>
	<input type="hidden" name="id" value={entryId} />
	<GradeButton value={0} {grade} class="bg-incorrect text-incorrect focus:ring-incorrect/40"
		><MoodCryIcon /></GradeButton
	>
	<GradeButton
		value={2}
		{grade}
		class="bg-barely-incorrect text-barely-incorrect focus:ring-barely-incorrect/40"
		><MoodPuzzledIcon /></GradeButton
	>
	<GradeButton
		value={4}
		{grade}
		class="bg-barely-correct text-barely-correct focus:ring-barely-correct/20"
		><MoodSickIcon /></GradeButton
	>
	<GradeButton value={5} {grade} class="bg-correct text-correct focus:ring-correct/20"
		><MoodCheckIcon /></GradeButton
	>
</form>
