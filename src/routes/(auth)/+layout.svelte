<script lang="ts">
	import Logo from '$icons/Logo.svelte';
	import { PUBLIC_VERSION } from '$env/static/public';
</script>

<main class="mx-auto w-full max-w-lg flex-1 px-2">
	<h1 class="mb-4 flex items-center font-title text-7xl tracking-tighter sm:text-8xl">
		<Logo class="text-primary" />Souvenir
	</h1>

	<h2 class="mb-8 text-balance text-center text-muted">
		One timeline to store your small notes, and remind you of them.
	</h2>

	<slot />
</main>

<footer class="mx-auto w-full max-w-lg px-2 pb-2">
	<p class="text-xs text-muted">
		Version <span class="font-mono">{PUBLIC_VERSION.substring(0, 6)}</span>
		built by <a href="https://ben.oertel.fr" target="_blank">Benjamin Oertel</a> in 2024
	</p>
</footer>
