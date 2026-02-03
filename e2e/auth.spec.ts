import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display landing page with logo', async ({ page }) => {
    await page.goto('/');

    // Landing page shows logo and tagline
    await expect(page.locator('text=오롯이 나를 위해 단단해지는 시간')).toBeVisible();
  });

  test('should auto-redirect to login page', async ({ page }) => {
    await page.goto('/');

    // Wait for auto-redirect (2.5 seconds animation + redirect)
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('should show login form elements', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[placeholder="이메일"]')).toBeVisible();
    await expect(page.locator('input[placeholder="연구참여번호"]')).toBeVisible();
    await expect(page.locator('button:has-text("시작하기")')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    await page.click('button:has-text("시작하기")');

    await expect(page.locator('text=이메일을 입력해주세요.')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[placeholder="이메일"]');
    await emailInput.fill('invalid-email');
    await page.fill('input[placeholder="연구참여번호"]', 'P12345678');

    // Submit the form
    await page.locator('button:has-text("시작하기")').click();

    // Browser's native HTML5 email validation should mark the input as invalid
    // Check if input has :invalid pseudo-class (HTML5 validation)
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show validation error for short participant ID', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[placeholder="이메일"]', 'test@example.com');
    await page.fill('input[placeholder="연구참여번호"]', 'P123');
    await page.click('button:has-text("시작하기")');

    await expect(page.locator('text=연구참여번호는 6자 이상이어야 합니다.')).toBeVisible();
  });

  test('should navigate back to home page', async ({ page }) => {
    await page.goto('/login');

    await page.click('button[aria-label="뒤로 가기"]');

    await expect(page).toHaveURL('/');
  });

  test('should redirect protected routes to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/main');

    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });
});
