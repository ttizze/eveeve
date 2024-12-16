import { describe, expect, test } from "vitest";
import { prisma } from "~/utils/prisma";
import { processHtmlContent } from "./processHtmlContent";

describe("processHtmlContent", () => {
	test("HTML入力を処理し、source_texts挿入とdata-id付きspanが生成されるかテスト", async () => {
		const pageSlug = "html-test-page";
		const title = "Title";
		const htmlInput = `
      <p>This is a test.</p>
      <p>This is another test.</p>
    `;

		const user = await prisma.user.upsert({
			where: { id: 10 },
			create: {
				id: 10,
				userName: "htmltester",
				email: "htmltester@example.com",
				displayName: "htmltester",
				icon: "htmltester",
			},
			update: {},
		});

		// HTMLを処理
		await processHtmlContent(title, htmlInput, pageSlug, user.id, "en", true);

		// ページがDBに存在し、HTMLが変換されているか確認
		const dbPage = await prisma.page.findUnique({
			where: { slug: pageSlug },
			include: { sourceTexts: true },
		});
		expect(dbPage).not.toBeNull();
		if (!dbPage) return;
		expect(dbPage.sourceTexts.length).toBeGreaterThanOrEqual(2);

		// ページHTMLがdata-id付きspanを含むか確認
		const updatedPage = await prisma.page.findUnique({
			where: { slug: pageSlug },
		});

		expect(updatedPage).not.toBeNull();
		if (!updatedPage) return;
		const htmlContent = updatedPage.content;

		expect(htmlContent).toMatch(
			/<span data-source-text-id="\d+">This is a test\.<\/span>/,
		);
		expect(htmlContent).toMatch(
			/<span data-source-text-id="\d+">This is another test\.<\/span>/,
		);

		// source_textsのnumberが連番になっているか
		const sortedTexts = dbPage.sourceTexts.sort((a, b) => a.number - b.number);
		expect(sortedTexts[0].number).toBe(0);
		expect(sortedTexts[1].number).toBe(1);

		// hashが設定されているか
		for (const st of sortedTexts) {
			expect(st.textAndOccurrenceHash).not.toBeNull();
		}
	});

	test("HTML入力を編集後再度処理し、IDが保持・追加・変更されるか確認", async () => {
		const pageSlug = "html-test-page-edit";
		const originalTitle = " <h1>Title</h1>";
		const originalHtml = `
      <p>This is a line.</p>
      <p>This is another line.</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
    `;

		const user = await prisma.user.upsert({
			where: { id: 11 },
			create: {
				id: 11,
				userName: "htmleditor",
				email: "htmleditor@example.com",
				displayName: "htmleditor",
				icon: "htmleditor",
			},
			update: {},
		});

		// 初回処理
		await processHtmlContent(
			originalTitle,
			originalHtml,
			pageSlug,
			user.id,
			"en",
			true,
		);

		const dbPage1 = await prisma.page.findUnique({
			where: { slug: pageSlug },
			include: { sourceTexts: true },
		});
		expect(dbPage1).not.toBeNull();
		if (!dbPage1) return;

		expect(dbPage1.sourceTexts.length).toBeGreaterThanOrEqual(4);
		const originalMap = new Map<string, number>();
		for (const st of dbPage1.sourceTexts) {
			originalMap.set(st.text, st.id);
		}

		// HTML変更
		const editedTitle = " <h1>Edited Title</h1>";
		const editedHtml = `
      <p>This is a line!?</p>
      <p>This is another line.</p>
      <p>new line</p>
      <ol>
        <li>List item 1</li>
        <li>List item 2</li>
      </ol>
    `;

		// 再処理
		await processHtmlContent(
			editedTitle,
			editedHtml,
			pageSlug,
			user.id,
			"en",
			true,
		);

		const dbPage2 = await prisma.page.findUnique({
			where: { slug: pageSlug },
			include: { sourceTexts: true },
		});
		expect(dbPage2).not.toBeNull();
		if (!dbPage2) return;

		expect(dbPage2.sourceTexts.length).toBeGreaterThanOrEqual(5);
		const editedMap = new Map<string, number>();
		for (const st of dbPage2.sourceTexts) {
			editedMap.set(st.text, st.id);
		}

		// 変更無しテキストは同じIDを維持
		expect(editedMap.get("This is another line.")).toBe(
			originalMap.get("This is another line."),
		);

		// 変更後テキストは新ID
		expect(editedMap.get("This is a line!?")).not.toBe(
			originalMap.get("This is a line."),
		);

		// 新規テキストは新IDであること
		expect(editedMap.get("new line")).not.toBe(originalMap.get("1"));

		// 既存リストアイテムはテキストが同じならID維持
		expect(editedMap.get("List item 1")).toBe(originalMap.get("List item 1"));
	});

	test("タイトルと同じ文章が本文に含まれている場合に正しく処理されるかテスト", async () => {
		const pageSlug = "html-title-duplicate-test-page";
		const title = "Unique Title";
		const htmlInput = `
      <h1>${title}</h1>
      <p>This is a paragraph with the Unique Title embedded.</p>
      <p>Another paragraph.</p>
    `;

		const user = await prisma.user.upsert({
			where: { id: 12 },
			create: {
				id: 12,
				userName: "titleduplicateuser",
				email: "titleduplicateuser@example.com",
				displayName: "titleduplicateuser",
				icon: "titleduplicateuser",
			},
			update: {},
		});

		// HTMLを処理
		await processHtmlContent(title, htmlInput, pageSlug, user.id, "en", true);

		// ページがDBに存在し、HTMLが変換されているか確認
		const dbPage = await prisma.page.findUnique({
			where: { slug: pageSlug },
			include: { sourceTexts: true },
		});
		expect(dbPage).not.toBeNull();
		if (!dbPage) return;

		// source_textsが適切に挿入されているか確認
		expect(dbPage.sourceTexts.length).toBeGreaterThanOrEqual(3); // title + 2 paragraphs

		// ページHTMLがdata-id付きspanを含むか確認
		const updatedPage = await prisma.page.findUnique({
			where: { slug: pageSlug },
		});

		expect(updatedPage).not.toBeNull();
		if (!updatedPage) return;
		const htmlContent = updatedPage.content;

		// タイトル部分のspanを確認
		expect(htmlContent).toMatch(
			new RegExp(`<h1><span data-source-text-id="\\d+">${title}</span></h1>`),
		);

		// 本文中のタイトルのspanを確認
		expect(htmlContent).toMatch(
			new RegExp(`<span data-source-text-id="\\d+">${title}</span>`),
		);

		// その他の本文のspanを確認
		expect(htmlContent).toMatch(
			/<span data-source-text-id="\d+">This is a paragraph with the Unique Title embedded\.<\/span>/,
		);
		expect(htmlContent).toMatch(
			/<span data-source-text-id="\d+">Another paragraph\.<\/span>/,
		);

		// source_textsのnumberが連番になっているか
		const sortedTexts = dbPage.sourceTexts.sort((a, b) => a.number - b.number);
		sortedTexts.forEach((st, index) => {
			expect(st.number).toBe(index);
			expect(st.textAndOccurrenceHash).not.toBeNull();
		});

		// タイトルと本文で同じテキストが異なるsource_textsとして扱われているか
		const titleOccurrences = dbPage.sourceTexts.filter(
			(st) => st.text === title,
		);
		expect(titleOccurrences.length).toBe(2); // One in title, one in content

		// 各タイトル occurrence が異なる ID を持つことを確認
		expect(titleOccurrences[0].id).not.toBe(titleOccurrences[1].id);
	});
});
