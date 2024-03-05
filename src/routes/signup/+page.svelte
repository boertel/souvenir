<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="post" use:enhance>
	<input class="bg-transparent" type="text" name="username" />
	<input class="bg-transparent" type="password" name="password" />
	<button>Sign up</button>
</form>
