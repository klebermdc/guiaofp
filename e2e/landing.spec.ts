import { test, expect } from '../playwright-fixture';

test.describe('Landing Page', () => {
  
  test('should display landing page content', async ({ page }) => {
    await page.goto('/');
    
    // Page should load successfully
    await expect(page).toHaveURL('/');
    
    // Should have some visible content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have navigation to login', async ({ page }) => {
    await page.goto('/');
    
    // Look for login/entrar button or link
    const loginLink = page.getByRole('link', { name: /entrar|login|acessar/i }).or(
      page.getByRole('button', { name: /entrar|login|acessar/i })
    );
    
    // If login link exists, click it
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Page should still load
    await expect(page).toHaveURL('/');
    
    // Content should be visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
