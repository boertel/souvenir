<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Logo from '$icons/Logo.svelte';
</script>

<main class="mx-auto w-full max-w-lg">
	<h1 class="font-title mb-4 flex items-center text-8xl tracking-tighter">
		<Logo class="text-primary" />Souvenir
	</h1>

	<h2 class="mb-8 text-center text-muted">
		One timeline to store your small notes, and remind you of them.
	</h2>

	<form method="post" use:enhance class="mx-auto flex w-full max-w-sm flex-col gap-4">
		<label>
			<p>Username</p>
			<Input autocomplete="off" type="text" name="username" />
		</label>
		<label>
			<p>Password</p>
			<Input autocomplete="off" type="password" name="password" />
		</label>
		<Button>Login</Button>
	</form>
</main>
