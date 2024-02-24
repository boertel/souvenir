<script lang="ts">
	export let style: string = '--current-color: var(--primary)';
</script>

<button {style} class="transition-transform" {...$$restProps} on:click>
	<slot />
</button>

<style>
	button {
		outline: none;
		font-size: 1.1rem;
		padding: 2px;
		border-radius: 4px;
	}
	button:hover,
	button:focus {
		background-color: hsl(var(--current-color) / 0.2);
		color: hsl(var(--current-color));
	}
</style>
