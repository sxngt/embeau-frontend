import { test, expect } from '@playwright/test';

test.describe('Feature Pages (Unauthenticated)', () => {
  test.describe('Protected Route Redirects', () => {
    test('color-diagnosis should redirect to login', async ({ page }) => {
      await page.goto('/color-diagnosis');
      await expect(page).toHaveURL('/login');
    });

    test('emotion-map should redirect to login', async ({ page }) => {
      await page.goto('/emotion-map');
      await expect(page).toHaveURL('/login');
    });

    test('healing-color should redirect to login', async ({ page }) => {
      await page.goto('/healing-color');
      await expect(page).toHaveURL('/login');
    });

    test('insight should redirect to login', async ({ page }) => {
      await page.goto('/insight');
      await expect(page).toHaveURL('/login');
    });

    test('recommendation should redirect to login', async ({ page }) => {
      await page.goto('/recommendation');
      await expect(page).toHaveURL('/login');
    });
  });
});

test.describe('Login Page Features', () => {
  test('should have email input', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[placeholder="이메일"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should have participant ID input', async ({ page }) => {
    await page.goto('/login');

    const participantInput = page.locator('input[placeholder="연구참여번호"]');
    await expect(participantInput).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button:has-text("시작하기")');
    await expect(submitButton).toBeVisible();
  });

  test('should display auto-registration notice', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('text=처음 방문하시면 자동으로 계정이 생성됩니다.')).toBeVisible();
  });

  test('should allow form input', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[placeholder="이메일"]');
    const participantInput = page.locator('input[placeholder="연구참여번호"]');

    await emailInput.fill('test@example.com');
    await participantInput.fill('P12345678');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(participantInput).toHaveValue('P12345678');
  });
});

test.describe('Landing Page Features', () => {
  test('should display app tagline', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=오롯이 나를 위해 단단해지는 시간')).toBeVisible();
  });

  test('should have animated transition', async ({ page }) => {
    await page.goto('/');

    // Check for transition classes
    const container = page.locator('div.transition-all');
    await expect(container).toBeVisible();
  });
});
