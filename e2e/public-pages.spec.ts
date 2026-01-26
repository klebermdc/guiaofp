import { test, expect } from '../playwright-fixture';

test.describe('Public Pages Accessibility', () => {
  
  test('login page loads without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected warnings (React Router future flags)
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('React Router Future Flag') && 
             !err.includes('Warning:')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('landing page loads without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected warnings
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('React Router Future Flag') && 
             !err.includes('Warning:')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('password recovery page loads correctly', async ({ page }) => {
    await page.goto('/recuperar-senha');
    
    // Should have email input for recovery
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test(`landing page renders on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Page should render
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // No layout overflow (basic check)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small margin
    });

    test(`login page renders on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/login');
      
      // Form elements should be visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });
  }
});
