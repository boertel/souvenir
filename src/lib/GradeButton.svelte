<script lang="ts">
	import { cn } from '$lib/utils';

	export let grade: number | null;
	export let value: number;

	let className: string;
	export { className as class };
</script>

<button
	name="grade"
	{value}
	class={cn(
		grade !== null && grade !== value ? 'text-gray-500 grayscale' : className,
		'rounded-full bg-opacity-0 p-1 outline-none ring-2 ring-transparent transition-all hover:scale-105 hover:bg-opacity-20'
	)}><slot /></button
>
