<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	import { oneDark } from '@codemirror/theme-one-dark';
	import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view';
	import { EditorState, type Extension } from '@codemirror/state';
	import { indentWithTab } from '@codemirror/commands';
	import { indentUnit } from '@codemirror/language';
	import { markdown } from '@codemirror/lang-markdown';

	const dispatch = createEventDispatcher();

	let element: HTMLDivElement;
	export let view: EditorView;

	let className: string = '';
	export { className as class };
	export let defaultValue = '';
	let value = defaultValue;

	let updateListenerExtension = EditorView.updateListener.of((update) => {
		if (update.docChanged) {
			value = update.state.doc.toString();
			dispatch('change', update);
		}
	});

	let onDomEvent = EditorView.domEventHandlers({
		keydown(evt) {
			if (evt.metaKey && evt.key === 'Enter') {
				evt.preventDefault();
				dispatch('keydown', evt);
				view.setState(createEditorState(''));
			}
		}
	});

	const extensions: Extension[] = [
		indentUnit.of(' '.repeat(4)),
		keymap.of([indentWithTab]),
		markdown(),
		EditorView.lineWrapping,
		EditorView.theme({
			'&': {
				backgroundColor: 'transparent',
				color: 'white',
				padding: 0
			},
			'.cm-content': {
				fontFamily: 'ui-sans-serif, system-ui',
				padding: 0,
				caretColor: 'hsl(var(--primary))'
			},
			'.cm-line': {
				padding: 0
			},
			'.cm-scroller': {
				lineHeight: 'inherit'
			},
			'&.cm-focused': {
				outline: 'none !important'
			}
		}),
		oneDark,
		placeholderExtension('Write something...'),
		onDomEvent,
		updateListenerExtension
	];

	function createEditorState(value: string | null | undefined): EditorState {
		return EditorState.create({
			doc: value ?? defaultValue ?? undefined,
			extensions
		});
	}

	function createEditorView(): EditorView {
		return new EditorView({
			parent: element,
			state: createEditorState(value),
			dispatch(transaction) {
				view.update([transaction]);
			}
		});
	}

	onMount(() => (view = createEditorView()));
	onDestroy(() => view?.destroy());
</script>

{#if browser}
	<div bind:this={element} class={className} />
	<input type="hidden" name="content" {value} />
{/if}
