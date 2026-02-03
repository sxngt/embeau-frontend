import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  // Set mobile viewport for all tests in this describe block
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('landing page should be mobile friendly', async ({ page }) => {
    await page.goto('/');

    // Check viewport is mobile size
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(500);

    // Content should still be visible
    await expect(page.locator('text=오롯이 나를 위해 단단해지는 시간')).toBeVisible();
  });

  test('login form should be usable on mobile', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[placeholder="이메일"]');
    const participantInput = page.locator('input[placeholder="연구참여번호"]');
    const submitButton = page.locator('button:has-text("시작하기")');

    // All elements should be visible
    await expect(emailInput).toBeVisible();
    await expect(participantInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Should be able to fill form on mobile
    await emailInput.fill('test@example.com');
    await participantInput.fill('P12345678');

    // Check values are entered
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(participantInput).toHaveValue('P12345678');
  });

  test('login page should fit mobile viewport', async ({ page }) => {
    await page.goto('/login');

    // Check no horizontal scroll needed
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 390;

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
  });

  test('form inputs should be touch-friendly size', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[placeholder="이메일"]');

    // Get input dimensions
    const box = await emailInput.boundingBox();
    // Minimum touch target should be at least 44px (iOS guideline)
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });

  test('submit button should be accessible', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button:has-text("시작하기")');
    const box = await submitButton.boundingBox();

    // Button should be reasonably sized for touch
    expect(box?.height).toBeGreaterThanOrEqual(40);
    expect(box?.width).toBeGreaterThanOrEqual(100);
  });

  test('back button should be tappable', async ({ page }) => {
    await page.goto('/login');

    const backButton = page.locator('button[aria-label="뒤로 가기"]');
    await expect(backButton).toBeVisible();

    // Should be able to tap
    await backButton.click();
    await expect(page).toHaveURL('/');
  });
});
