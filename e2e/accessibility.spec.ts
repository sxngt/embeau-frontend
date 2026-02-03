import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('landing page should have visible content', async ({ page }) => {
    await page.goto('/');

    // Check for visible text content
    const content = await page.locator('p').textContent();
    expect(content).toContain('오롯이 나를 위해');
  });

  test('login form should have accessible labels', async ({ page }) => {
    await page.goto('/login');

    // Check inputs have accessible names via placeholder
    const emailInput = page.locator('input[placeholder="이메일"]');
    await expect(emailInput).toBeVisible();

    const participantInput = page.locator('input[placeholder="연구참여번호"]');
    await expect(participantInput).toBeVisible();
  });

  test('buttons should be focusable via keyboard', async ({ page }) => {
    await page.goto('/login');

    // Focus on first input
    await page.locator('input[placeholder="이메일"]').focus();

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should reach the button
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedTag);
  });

  test('back button should have aria-label', async ({ page }) => {
    await page.goto('/login');

    const backButton = page.locator('button[aria-label="뒤로 가기"]');
    await expect(backButton).toBeVisible();
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/login');

    // Focus on email input
    await page.locator('input[placeholder="이메일"]').focus();

    // Tab through form
    await page.keyboard.press('Tab');
    const focusedPlaceholder = await page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement;
      return el?.placeholder;
    });
    expect(focusedPlaceholder).toBe('연구참여번호');

    // Tab to button
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBe('BUTTON');
  });

  test('form inputs should have proper types', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[placeholder="이메일"]');
    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email');
  });
});
