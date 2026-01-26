import { test, expect } from '../playwright-fixture';

test.describe('Authentication Flow', () => {
  
  test('should display login page with all elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Check for password input
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Check for login button
    await expect(page.getByRole('button', { name: /entrar|login|sign in/i })).toBeVisible();
    
    // Check for forgot password link
    await expect(page.getByText(/esquec/i)).toBeVisible();
  });

  test('should show validation error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const loginButton = page.getByRole('button', { name: /entrar|login|sign in/i });
    await loginButton.click();
    
    // Should still be on login page (form validation prevents submission)
    await expect(page).toHaveURL(/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword123');
    
    // Submit form
    const loginButton = page.getByRole('button', { name: /entrar|login|sign in/i });
    await loginButton.click();
    
    // Wait for error message or stay on login page
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/login/);
  });

  test('should navigate to password recovery page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    const forgotLink = page.getByText(/esquec/i);
    await forgotLink.click();
    
    // Should navigate to recovery page
    await expect(page).toHaveURL(/recuperar-senha/);
  });
});
