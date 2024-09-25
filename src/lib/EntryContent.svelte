<script lang="ts">
	import { enhance } from '$app/forms';

	let taskForm: HTMLFormElement;

	export function onTaskFormChange() {
		taskForm.submit();
	}

	let className: string = '';
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

<style>
	:global(p) {
		@apply overflow-hidden text-ellipsis;
	}
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
  :global(ul){
    list-style: disc;
    list-style-position: inside;
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
