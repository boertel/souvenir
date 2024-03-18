<script lang="ts">
	import { enhance } from '$app/forms';

	let taskForm: HTMLFormElement;

	export function onTaskFormChange(evt: CustomEvent) {
		console.log(evt);
		taskForm.submit();
	}

	let className: string;
	export { className as class };

	export let html: string;
	export let entryId: string;
</script>

<form
	method="POST"
	action="?/task"
	use:enhance
	on:change={onTaskFormChange}
	bind:this={taskForm}
	class={className}
>
	<input type="hidden" name="id" value={entryId} />
	<p class="">{@html html}</p>
</form>
