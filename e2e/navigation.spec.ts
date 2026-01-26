import { test, expect } from '../playwright-fixture';

test.describe('Navigation Flow (Unauthenticated)', () => {
  
  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing map', async ({ page }) => {
    // Try to access map directly
    await page.goto('/mapa');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing profile', async ({ page }) => {
    // Try to access profile directly
    await page.goto('/perfil');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect to login when accessing agenda', async ({ page }) => {
    // Try to access agenda directly
    await page.goto('/agenda');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('404 Page', () => {
  
  test('should show 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-route-12345');
    
    // Should show 404 content
    await expect(page.getByText('404')).toBeVisible();
  });
});
