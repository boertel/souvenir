<script lang="ts">
	import { enhance } from '$app/forms';
	import { markdownToHtml } from '$lib/markdown';

	let taskForm: HTMLFormElement;

	export function onTaskFormChange(evt: CustomEvent) {
		console.log(evt);
		taskForm.submit();
	}

	export let content: string;
	export let entryId: string;

	const promise = markdownToHtml(content);
</script>

<form method="POST" action="?/task" use:enhance on:change={onTaskFormChange} bind:this={taskForm}>
	<input type="hidden" name="id" value={entryId} />
	<p class="">{#await promise then result}{@html result}{/await}</p>
</form>
