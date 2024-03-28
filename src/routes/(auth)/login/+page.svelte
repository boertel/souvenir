<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
</script>

<form method="post" use:enhance class="mx-auto flex w-full max-w-sm flex-col gap-4">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>
		<p>Username</p>
		<Input autocomplete="off" type="text" name="username" />
	</label>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>
		<p>Password</p>
		<Input autocomplete="off" type="password" name="password" />
	</label>
	<Button type="submit">Login</Button>
	<p class="text-center">
		Don't have an account?
		<a href="/signup">Sign up</a>.
	</p>
</form>
