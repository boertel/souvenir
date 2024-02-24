import { gfmTaskListItemFromMarkdown } from 'mdast-util-gfm-task-list-item';
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import { findAndReplace } from 'hast-util-find-and-replace';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

export function markdownToAst() {
	return (
		unified()
			// base Markdown -> MD AST
			.use(remarkParse)
			// MD AST -> MD AST transforms
			.use(remarkGfm)
	);
}

export function markdownToHtml(content: string): Promise<any> {
	return (
		markdownToAst()
			// MD AST -> HTML AST
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(renderColorHex)
			// HTML AST -> HTML AST transforms
			.use(updateCheckbox)
			.use(rehypeStringify)
			.process(content)
	);
}

export function checkbox(options) {
	return function () {
		const self = this;
		const data = self.data();

		const fromMarkdownExtensions =
			data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

		fromMarkdownExtensions.push([setCheckForCheckbox(options)]);
	};
}

export function setCheckForCheckbox(checks: Record<number, boolean>) {
	// calling with setCheckForCheckbox({ 1: true, 2: true }) will mark the first two checkboxes as checked
	const {
		exit: { taskListCheckValueUnchecked: originalExitCheck, paragraph }
	} = gfmTaskListItemFromMarkdown();

	function exitCheck(token) {
		// assuming a list item is on 1 line
		const { line } = token.start;
		token.type = checks[line] ? 'taskListCheckValueChecked' : 'taskListCheckValueUnchecked';
		// https://github.com/syntax-tree/mdast-util-gfm-task-list-item/blob/2.0.0/lib/index.js#L49-L54
		originalExitCheck.call(this, token);
	}

	return {
		exit: {
			taskListCheckValueChecked: exitCheck,
			taskListCheckValueUnchecked: exitCheck,
			paragraph
		}
	};
}

export function updateCheckbox() {
	return (tree) => {
		visit(tree, 'element', (node, _, parentNode) => {
			if (node.tagName === 'input' && node.properties?.disabled) {
				node.properties.disabled = undefined;
				// this works but need  more work to make it pretty
				// node.properties.className = 'bg-red-500 w-2 h-2 appearance-none';
				// not perfect but works
				node.properties.name = parentNode.position.start.line;
			}
		});
	};
}

export function renderColorHex() {
	return function (tree) {
		findAndReplace(tree, [
			[
				/#([a-fA-F0-9]+)/g,
				function (_, $1) {
					return h(
						'div',
						{
							style: `display: inline-flex; gap: 0.25rem; align-items: center;`
						},
						[
							h('div', {
								style: `background-color: #${$1}; width: 1em; height: 1em; border-radius: 100%; margin-top: -1px;`
							}),
							h('span', { style: 'font-family: monospace' }, `#${$1}`)
						]
					);
				}
			]
		]);
	};
}
