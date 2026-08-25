import { expect, type Page } from '@playwright/test';

/** レイアウト検証時に比較する要素の矩形。 */
interface LayoutBox {
  label: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * ページに横方向のはみ出しがないことを確認する。
 *
 * @param page 検証対象のブラウザページ
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const sizes = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
  }));

  expect(sizes.contentWidth).toBeLessThanOrEqual(sizes.viewportWidth);
}

/**
 * 主要レイアウト要素が画面左右へはみ出さず、互いに重ならないことを確認する。
 *
 * 縦方向は一覧画面の正常なスクロールを許可し、要素同士の重なりだけを検証する。
 *
 * @param page 検証対象のブラウザページ
 * @param selector 兄弟関係にある主要レイアウト要素のセレクター
 */
export async function expectResponsiveLayout(page: Page, selector: string): Promise<void> {
  const headerLayout = await page.locator('header').evaluate((header) => {
    const headerBox = header.getBoundingClientRect();
    const main = header.closest('main');
    const mainBox = main?.getBoundingClientRect();
    const mainStyle = main ? getComputedStyle(main) : undefined;
    const headingBox = header.querySelector('h1')?.getBoundingClientRect();
    const toolsBox = header.querySelector('.header-tools')?.getBoundingClientRect();
    const mainContentWidth =
      (mainBox?.width ?? 0) -
      Number.parseFloat(mainStyle?.paddingLeft ?? '0') -
      Number.parseFloat(mainStyle?.paddingRight ?? '0');
    return {
      width: headerBox.width,
      expectedWidth: Math.min(1120, mainContentWidth),
      headingOffset: (headingBox?.left ?? 0) - headerBox.left,
      toolsOffset: headerBox.right - (toolsBox?.right ?? 0),
    };
  });
  expect(Math.abs(headerLayout.width - headerLayout.expectedWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(headerLayout.headingOffset)).toBeLessThanOrEqual(1);
  expect(Math.abs(headerLayout.toolsOffset)).toBeLessThanOrEqual(1);

  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  const boxes = await page.locator(selector).evaluateAll((elements): LayoutBox[] =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: `${element.tagName.toLowerCase()}${
            element.className ? `.${String(element.className).trim().replaceAll(' ', '.')}` : ''
          }`,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      })
      .filter((box) => box.right > box.left && box.bottom > box.top),
  );

  expect(boxes.length).toBeGreaterThan(0);

  for (const box of boxes) {
    expect.soft(box.left, `${box.label}の左端`).toBeGreaterThanOrEqual(0);
    expect.soft(box.right, `${box.label}の右端`).toBeLessThanOrEqual(viewportWidth);
  }

  for (const [index, first] of boxes.entries()) {
    for (const second of boxes.slice(index + 1)) {
      const overlapsHorizontally =
        first.left < second.right - 0.5 && second.left < first.right - 0.5;
      const overlapsVertically = first.top < second.bottom - 0.5 && second.top < first.bottom - 0.5;

      expect
        .soft(
          overlapsHorizontally && overlapsVertically,
          `${first.label}と${second.label}が重ならないこと`,
        )
        .toBe(false);
    }
  }
}

/**
 * 子要素がoverflowで隠れず、指定したコンテナの左右端に収まることを確認する。
 *
 * @param page 検証対象のブラウザページ
 * @param containerSelector 子要素を収めるコンテナのセレクター
 * @param childSelector 端まで表示される必要がある子要素のセレクター
 */
export async function expectElementsWithin(
  page: Page,
  containerSelector: string,
  childSelector: string,
): Promise<void> {
  const container = await page.locator(containerSelector).boundingBox();
  expect(container).not.toBeNull();
  const children = await page.locator(childSelector).evaluateAll((elements): LayoutBox[] =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: `${element.tagName.toLowerCase()}${
            element.className ? `.${String(element.className).trim().replaceAll(' ', '.')}` : ''
          }`,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      })
      .filter((box) => box.right > box.left && box.bottom > box.top),
  );
  expect(children.length).toBeGreaterThan(0);

  for (const child of children) {
    expect.soft(child.left, `${child.label}の左端`).toBeGreaterThanOrEqual(container!.x);
    expect
      .soft(child.right, `${child.label}の右端`)
      .toBeLessThanOrEqual(container!.x + container!.width);
  }
}
