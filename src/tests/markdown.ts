import { describe, it, expect } from 'vitest';

import { gfmTaskListItem } from 'micromark-extension-gfm-task-list-item';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
	gfmTaskListItemFromMarkdown,
	gfmTaskListItemToMarkdown
} from 'mdast-util-gfm-task-list-item';
import { toMarkdown } from 'mdast-util-to-markdown';

describe('markdown', () => {
	it('should work', async () => {
		const doc = `
    - [ ] task a
    - [ ] task b
    - [ ] task c
    `;

		const tree = fromMarkdown(doc, {
			extensions: [gfmTaskListItem()],
			mdastExtensions: [gfmTaskListItemFromMarkdown()]
		});

		console.log(tree);

		const out = toMarkdown(tree, { extensions: [gfmTaskListItemToMarkdown()] });

		console.log(out);
	});
});
