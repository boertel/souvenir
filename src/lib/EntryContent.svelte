<script lang="ts">
	import { enhance } from '$app/forms';
	import { markdownToHtml } from '$lib/markdown';

	let taskForm: HTMLFormElement;

	export function onTaskFormChange(evt: CustomEvent) {
		console.log(evt);
		taskForm.submit();
	}

	export let html: string;
	export let entryId: string;
</script>

<form method="POST" action="?/task" use:enhance on:change={onTaskFormChange} bind:this={taskForm}>
	<input type="hidden" name="id" value={entryId} />
	<p class="">{@html html}</p>
</form>
