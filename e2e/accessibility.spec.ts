import { test, expect } from '../playwright-fixture';

test.describe('Basic Accessibility Checks', () => {
  
  test('login form has proper labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email label or aria-label
    const emailInput = page.locator('input[type="email"]');
    const emailLabel = await emailInput.getAttribute('aria-label') || 
                       await emailInput.getAttribute('placeholder');
    expect(emailLabel).toBeTruthy();
    
    // Check for password label or aria-label
    const passwordInput = page.locator('input[type="password"]');
    const passwordLabel = await passwordInput.getAttribute('aria-label') || 
                          await passwordInput.getAttribute('placeholder');
    expect(passwordLabel).toBeTruthy();
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/login');
    
    // Tab to first input
    await page.keyboard.press('Tab');
    
    // Should be able to focus form elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Get all headings
    const h1Count = await page.locator('h1').count();
    
    // Should have at least one h1
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Either has alt or is decorative (empty alt is valid for decorative)
      expect(alt).not.toBeNull();
    }
  });
});

test.describe('Color Contrast and Visibility', () => {
  
  test('text is visible against background on login', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that form elements are visible
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const loginButton = page.getByRole('button', { name: /entrar|login|sign in/i });
    await expect(loginButton).toBeVisible();
  });
});
