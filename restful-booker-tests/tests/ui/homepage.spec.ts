import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homepage.page';

test.describe('Homepage Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto('/');
    
    // await expect(homePage.title).toContainText('Welcome to Restful Booker Platform');
    await expect(homePage.title).toContainText('Welcome to Shady Meadows B&B');
    // await expect(homePage.hotelLogo).toBeVisible();
  });
});