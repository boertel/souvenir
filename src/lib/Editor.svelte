<script lang="ts">
	import { browser, building, dev, version } from '$app/environment';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	import { oneDark } from '@codemirror/theme-one-dark';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap, placeholder as placeholderExtension } from '@codemirror/view';
	import { EditorState, StateEffect, type Extension } from '@codemirror/state';
	import { indentWithTab } from '@codemirror/commands';
	import { indentUnit, type LanguageSupport } from '@codemirror/language';
	import { markdown } from '@codemirror/lang-markdown';

	const dispatch = createEventDispatcher();

	let element: HTMLDivElement;
	let view: EditorView;

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
				padding: 0
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
			doc: defaultValue ?? undefined,
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
	function onWindowKeyDown(evt) {
		if (evt.key === 'i') {
			evt.prefentDefault();
			view.focus();
		}
	}
</script>

<svelte:window on:keydown={onWindowKeyDown} />

{#if browser}
	<div bind:this={element} class="" />
	<input type="hidden" name="content" {value} />
{/if}
