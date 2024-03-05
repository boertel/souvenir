import { describe, it, expect } from 'vitest';
import remarkStringify from 'remark-stringify';
import { markdownToAst, checkbox, markdownToHtml } from '$lib/markdown';

describe('markdown', () => {
	it('should work', async () => {
		const doc = `- [ ] a\n- [x] b`;

		const tree = await markdownToAst()
			.use(checkbox({ 1: true, 2: true }))
			.use(remarkStringify, { bullet: '-' })
			.process(doc);

		expect(String(tree)).toBe(`- [x] a\n- [x] b\n`);
	});

	it('quote', async () => {
		const content = `https://example.com/#:~:text=quote`;

		const html = await markdownToHtml(content);

		expect(String(html)).toBe(
			`<div><blockquote>quote</blockquote><a href="https://example.com/#:~:text=quote" target="_blank" rel="noopener noreferrer">https://example.com/</a></div>`
		);
	});
});
