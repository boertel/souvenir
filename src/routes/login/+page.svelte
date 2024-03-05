<script lang="ts">
	import { enhance } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
</script>

<form method="post" use:enhance class="mx-auto flex w-full max-w-sm flex-col gap-4">
	<label>
		<p>Username</p>
		<Input autocomplete="off" type="text" name="username" />
	</label>
	<label>
		<p>Password</p>
		<Input autocomplete="off" type="password" name="password" />
	</label>
	<button>Login</button>
</form>
