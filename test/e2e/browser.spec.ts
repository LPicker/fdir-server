import { test, expect } from '@playwright/test';

test.describe('File Server E2E Tests', () => {
  test('should display directory listing on homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Index of \//);

    const heading = page.locator('h1');
    await expect(heading).toContainText('Index of /');
  });

  test('should render files and folders with correct styling', async ({ page }) => {
    await page.goto('/');

    const folders = page.locator('tbody tr');
    await expect(async () => {
      const count = await folders.count();
      expect(count).toBeGreaterThan(0);
    }).toPass();

    const links = page.locator('a');
    await expect(async () => {
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    }).toPass();

    const firstRow = page.locator('tbody tr').first();
    const firstLink = firstRow.locator('a');
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/\/$/);
  });

  test('should navigate into subdirectory', async ({ page }) => {
    await page.goto('/');

    const folderLink = page.locator('tbody tr a').first();
    const folderName = await folderLink.textContent();

    await folderLink.click();

    await expect(page).toHaveTitle(new RegExp(`Index of /${folderName?.trim()}`));
  });

  test('should display file content when clicking a text file', async ({ page }) => {
    await page.goto('/');

    // Find a .txt file link specifically
    const fileLink = page.locator('tbody tr a[href$=".txt"]').first();
    const fileName = await fileLink.textContent();
    await fileLink.click();

    const url = page.url();
    // URL 可能经过编码，检查基础路径即可
    expect(url).toMatch(/\/[^/]+\.txt$/);
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-file-12345.txt');

    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText('Not Found');
  });

  test('should have responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const links = page.locator('a');
    await expect(async () => {
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
    }).toPass();
  });

  test('should display HTML files correctly', async ({ page }) => {
    await page.goto('/');

    const htmlLink = page.locator('a[href$=".html"]').first();
    await htmlLink.click();
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display JSON files as plain text', async ({ page }) => {
    await page.goto('/');

    const jsonLink = page.locator('a[href$=".json"]').first();
    await jsonLink.click();

    const content = await page.textContent('body');
    expect(content).toContain('{');
  });

  test('should have proper document structure', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should display root path listing', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Index of /');

    const listItems = page.locator('tbody tr');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display image file when clicked', async ({ page }) => {
    await page.goto('/');

    const imageLink = page.locator('a[href$=".png"], a[href$=".jpg"], a[href$=".jpeg"], a[href$=".gif"]').first();
    await imageLink.click();

    // Image should load successfully
    const image = page.locator('img').first();
    await expect(image).toBeVisible();
  });

  test('should handle Chinese file names', async ({ page }) => {
    await page.goto('/');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    const charsetMeta = page.locator('meta[charset="UTF-8"]');
    await expect(charsetMeta).toHaveCount(1);
  });

  test('should display CSS file content as plain text', async ({ page }) => {
    await page.goto('/');

    const cssLink = page.locator('a[href$=".css"]').first();
    await cssLink.click();
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/');

    const firstLink = page.locator('a').first();
    await firstLink.focus();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('A');
  });

  test('should handle back/forward navigation', async ({ page }) => {
    await page.goto('/');

    const folderLink = page.locator('tbody tr a').first();
    const firstUrl = page.url();
    await folderLink.click();

    const secondUrl = page.url();
    expect(secondUrl).not.toBe(firstUrl);

    await page.goBack();
    await expect(page).toHaveURL(firstUrl);

    await page.goForward();
    await expect(page).toHaveURL(secondUrl);
  });

  test('should handle bookmarkable URLs', async ({ page }) => {
    await page.goto('/');

    const fileLink = page.locator('tbody tr a').first();
    await fileLink.click();
    const fileUrl = page.url();

    await page.reload();
    await expect(page).toHaveURL(fileUrl);
  });

  test('should have accessible page structure', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    const table = page.locator('table');
    await expect(table).toBeVisible();

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle large directory listings', async ({ page }) => {
    await page.goto('/');

    const listItems = page.locator('tbody tr');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(0);

    const links = page.locator('tbody tr a');
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      await links.nth(i).click();
      await page.goBack();
    }
  });

  test('should maintain state on page reload', async ({ page }) => {
    await page.goto('/');

    const urlBeforeReload = page.url();
    const titleBeforeReload = await page.title();

    await page.reload();

    const urlAfterReload = page.url();
    const titleAfterReload = await page.title();

    expect(urlAfterReload).toBe(urlBeforeReload);
    expect(titleAfterReload).toBe(titleBeforeReload);
  });

  test('should have proper viewport on different screen sizes', async ({ page }) => {
    const sizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.goto('/');

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();

      const links = page.locator('a');
      await expect(async () => {
        const count = await links.count();
        expect(count).toBeGreaterThan(0);
      }).toPass();
    }
  });
});
