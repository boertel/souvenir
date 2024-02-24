import { describe, it, expect } from 'vitest';
import remarkStringify from 'remark-stringify';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';

import { markdownToAst, checkbox } from '$lib/markdown';

describe('markdown', () => {
	it('should work', async () => {
		const doc = `- [ ] a\n- [x] b`;

		/*
		const tree = fromMarkdown(doc, {
			// defining the syntax to expect from a GFM flavored markdown checkbox
			extensions: [gfmTaskListItem()],
			mdastExtensions: [setCheckForCheckbox({ 1: true, 2: true })]
		});

		const checkboxes = tree.children[0].children;

		expect(checkboxes[0].checked).toBe(true);
		expect(checkboxes[1].checked).toBe(true);
    */

		const tree = await markdownToAst()
			.use(checkbox({ 1: true, 2: true }))
			.use(remarkStringify)
			.process(doc);
		console.log(String(tree));
	});
});
