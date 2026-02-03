import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Landing Page', () => {
    test('should load landing page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/EMBEAU/i);
    });

    test('should display logo and tagline', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=오롯이 나를 위해 단단해지는 시간')).toBeVisible();
    });

    test('should auto-redirect to login after animation', async ({ page }) => {
      await page.goto('/');

      // Wait for auto-redirect (2.5 seconds animation + redirect)
      await page.waitForURL('/login', { timeout: 5000 });
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Login Page Navigation', () => {
    test('should have back button', async ({ page }) => {
      await page.goto('/login');

      const backButton = page.locator('button[aria-label="뒤로 가기"]');
      await expect(backButton).toBeVisible();
    });

    test('should navigate back to home when back button clicked', async ({ page }) => {
      await page.goto('/login');

      await page.click('button[aria-label="뒤로 가기"]');
      await expect(page).toHaveURL('/');
    });

    test('should show welcome messages', async ({ page }) => {
      await page.goto('/login');

      await expect(page.locator('text=오셨군요.')).toBeVisible();
      await expect(page.locator('text=오늘도 당신의 마음빛을 만나러 가볼까요?')).toBeVisible();
    });
  });

  test.describe('Protected Routes Redirect', () => {
    test('should redirect /main to login when unauthenticated', async ({ page }) => {
      await page.goto('/main');
      await expect(page).toHaveURL('/login');
    });

    test('should redirect /emotion-map to login when unauthenticated', async ({ page }) => {
      await page.goto('/emotion-map');
      await expect(page).toHaveURL('/login');
    });

    test('should redirect /healing-color to login when unauthenticated', async ({ page }) => {
      await page.goto('/healing-color');
      await expect(page).toHaveURL('/login');
    });

    test('should redirect /color-diagnosis to login when unauthenticated', async ({ page }) => {
      await page.goto('/color-diagnosis');
      await expect(page).toHaveURL('/login');
    });

    test('should redirect /recommendation to login when unauthenticated', async ({ page }) => {
      await page.goto('/recommendation');
      await expect(page).toHaveURL('/login');
    });

    test('should redirect /insight to login when unauthenticated', async ({ page }) => {
      await page.goto('/insight');
      await expect(page).toHaveURL('/login');
    });
  });
});
