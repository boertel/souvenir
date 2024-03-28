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
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label>
		<p>Confirm Password</p>
		<Input autocomplete="off" type="password" name="confirmPassword" />
	</label>
	<Button type="submit">Signup</Button>
	<a class="text-center" href="/login">Already have an account? Login</a>
</form>
