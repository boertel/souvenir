<script lang="ts">
	import Logo from '$icons/Logo.svelte';
	import { PUBLIC_VERSION } from '$env/static/public';
</script>

<main class="mx-auto w-full max-w-lg flex-1">
	<h1 class="mb-4 flex items-center font-title text-8xl tracking-tighter">
		<Logo class="text-primary" />Souvenir
	</h1>

	<h2 class="mb-8 text-center text-muted">
		One timeline to store your small notes, and remind you of them.
	</h2>

	<slot />
</main>

<footer class="mx-auto w-full max-w-lg">
	<ul class="grid grid-cols-[max-content_max-content] gap-x-4 text-xs text-muted">
		<li>Version <span class="font-mono">{PUBLIC_VERSION}</span></li>
		<li>built by <a href="https://ben.oertel.fr" target="_blank">Benjamin Oertel</a></li>
	</ul>
</footer>
