<script lang="ts">
	import { dayjs } from '$lib/dayjs';
	import { onDestroy, onMount } from 'svelte';

	let now = dayjs();
	let interval: ReturnType<typeof setInterval>;

	const timer = {
		start() {
			interval = setInterval(() => {
				now = dayjs();
			}, 1000 * 60);
		},

		stop() {
			if (interval) {
				clearInterval(interval);
			}
		}
	};

	function onVisibilityChange() {
		if (document.hidden) {
			timer.stop();
		} else {
			timer.start();
		}
	}

	onMount(() => {
		timer.start();
	});

	onDestroy(() => {
		timer.stop();
	});

	let className;
	export { className as class };
</script>

<svelte:window on:visibilitychange={onVisibilityChange} />

<time class={className}>{now.format('ddd, MMM D, HH:mm')}</time>
