// tests/performance/performance.spec.ts
import { test, expect } from '@playwright/test';
import { TestHelper } from '../../utils/test-helpers';
import { TEST_CONFIG } from '../../utils/constants';

test.describe('Performance Testing', () => {
  let testHelper: TestHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new TestHelper(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('https://automationintesting.online');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(TEST_CONFIG.PERFORMANCE.MAX_LOAD_TIME);
      
      await testHelper.generateTestReport('Homepage Load Time', {
        loadTime,
        threshold: TEST_CONFIG.PERFORMANCE.MAX_LOAD_TIME,
        passed: loadTime < TEST_CONFIG.PERFORMANCE.MAX_LOAD_TIME
      });
    });

    test('should load page efficiently on different viewport sizes', async ({ page }) => {
      const viewports = [
        TEST_CONFIG.VIEWPORT.DESKTOP,
        TEST_CONFIG.VIEWPORT.TABLET,
        TEST_CONFIG.VIEWPORT.MOBILE
      ];

      const results = [];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        const startTime = Date.now();
        await page.goto('https://automationintesting.online');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        results.push({
          viewport: `${viewport.width}x${viewport.height}`,
          loadTime,
          passed: loadTime < TEST_CONFIG.PERFORMANCE.MAX_LOAD_TIME
        });
        
        expect(loadTime).toBeLessThan(TEST_CONFIG.PERFORMANCE.MAX_LOAD_TIME);
      }

      await testHelper.generateTestReport('Responsive Load Times', results);
    });

    test('should measure First Contentful Paint (FCP)', async ({ page }) => {
      await page.goto('https://automationintesting.online');
      
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });

      expect(metrics).toBeLessThan(3000); // FCP should be under 3 seconds
    });

    test('should measure Largest Contentful Paint (LCP)', async ({ page }) => {
      await page.goto('https://automationintesting.online');
      
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });

      expect(lcp).toBeLessThan(4000); // LCP should be under 4 seconds
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load images efficiently', async ({ page }) => {
      const imageLoadTimes = [];
      
      page.on('response', response => {
        if (response.url().includes('.jpg') || response.url().includes('.png') || response.url().includes('.webp')) {
          imageLoadTimes.push({
            url: response.url(),
            status: response.status(),
            loadTime: response.timing()
          });
        }
      });

      await page.goto('https://automationintesting.online');
      await page.waitForLoadState('networkidle');
      
      // Check that images loaded successfully
      const failedImages = imageLoadTimes.filter(img => img.status !== 200);
      expect(failedImages.length).toBe(0);
      
      console.log(`Loaded ${imageLoadTimes.length} images successfully`);
    });

    test('should load CSS and JS resources efficiently', async ({ page }) => {
      const resourceLoadTimes = [];
      
      page.on('response', response => {
        if (response.url().includes('.css') || response.url().includes('.js')) {
          resourceLoadTimes.push({
            url: response.url(),
            status: response.status(),
            type: response.url().includes('.css') ? 'CSS' : 'JS',
            size: response.headers()['content-length']
          });
        }
      });

      await page.goto('https://automationintesting.online');
      await page.waitForLoadState('networkidle');
      
      // Check resource loading
      const failedResources = resourceLoadTimes.filter(resource => resource.status !== 200);
      expect(failedResources.length).toBe(0);
      
      console.log(`Loaded ${resourceLoadTimes.length} CSS/JS resources successfully`);
    });

    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G network
      await context.tracing.start({ screenshots: true, snapshots: true });
      
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100); // Add 100ms delay
      });

      const startTime = Date.now();
      await page.goto('https://automationintesting.online');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should still load within reasonable time even with network delay
      expect(loadTime).toBeLessThan(15000); // 15 seconds max for slow network
      
      await context.tracing.stop({ path: 'traces/slow-network-trace.zip' });
    });
  });

  test.describe('Memory and CPU Performance', () => {
    test('should not have memory leaks during booking flow', async ({ page }) => {
      // Initial memory measurement
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });

      // Perform booking flow multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('https://automationintesting.online');
        await page.locator('.openBooking').first().click();
        await page.waitForSelector('.room-booking-form');
        await page.locator('button').filter({ hasText: 'Cancel' }).click();
      }

      // Final memory measurement
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });

      // Memory growth should be reasonable
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(5000000); // Less than 5MB growth
      }
    });

    test('should handle multiple concurrent booking modals', async ({ page }) => {
      await page.goto('https://automationintesting.online');
      
      const startTime = Date.now();
      
      // Open multiple modals rapidly
      const roomButtons = page.locator('.openBooking');
      const roomCount = await roomButtons.count();
      
      for (let i = 0; i < Math.min(roomCount, 3); i++) {
        await roomButtons.nth(i).click();
        await page.waitForSelector('.room-booking-form');
        await page.locator('button').filter({ hasText: 'Cancel' }).click();
      }
      
      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});

// tests/accessibility/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { TestHelper } from '../../utils/test-helpers';

test.describe('Accessibility Testing', () => {
  let testHelper: TestHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new TestHelper(page);
    await page.goto('https://automationintesting.online');
  });

  test.describe('Keyboard Navigation', () => {
    test('should support tab navigation through main elements', async ({ page }) => {
      // Start from the beginning
      await page.keyboard.press('Tab');
      
      // Check if focus moves through interactive elements
      const focusableElements = await page.locator('button, input, select, textarea, a[href]').count();
      expect(focusableElements).toBeGreaterThan(0);
      
      // Test tab navigation
      for (let i = 0; i < Math.min(focusableElements, 10); i++) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
      }
    });

    test('should support keyboard navigation in booking modal', async ({ page }) => {
      await page.locator('.openBooking').first().click();
      await page.waitForSelector('.room-booking-form');
      
      // Test tab navigation within modal
      await page.keyboard.press('Tab');
      await expect(page.locator('input[placeholder="Firstname"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[placeholder="Lastname"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[placeholder="Email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[placeholder="Phone"]')).toBeFocused();
    });

    test('should support Enter key for form submission', async ({ page }) => {
      await page.locator('.openBooking').first().click();
      await page.waitForSelector('.room-booking-form');
      
      // Fill form
      await page.fill('input[placeholder="Firstname"]', 'John');
      await page.fill('input[placeholder="Lastname"]', 'Doe');
      await page.fill('input[placeholder="Email"]', 'john@example.com');
      await page.fill('input[placeholder="Phone"]', '01234567890');
      
      // Press Enter to submit
      await page.keyboard.press('Enter');
      
      // Should attempt to submit (may show validation errors)
      await page.waitForTimeout(1000);
      
      // Check if form was processed
      const hasError = await page.locator('.alert-danger').isVisible();
      const hasSuccess = await page.locator('.alert-success').isVisible();
      
      expect(hasError || hasSuccess).toBeTruthy();
    });

    test('should support Escape key to close modal', async ({ page }) => {
      await page.locator('.openBooking').first().click();
      await page.waitForSelector('.room-booking-form');
      
      // Press Escape to close modal
      await page.keyboard.press('Escape');
      
      // Modal should close
      await expect(page.locator('.room-booking-form')).not.toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper heading structure', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);
      
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check that headings are not empty
      headings.forEach(heading => {
        expect(heading.trim()).not.toBe('');
      });
    });

    test('should have proper form labels', async ({ page }) => {
      await page.locator('.openBooking').first().click();
      await page.waitForSelector('.room-booking-form');
      
      // Check form inputs have labels or aria-labels
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const placeholder = await input.getAttribute('placeholder');
        const ariaLabel = await input.getAttribute('aria-label');
        const label = await input.getAttribute('label');
        
        expect(placeholder || ariaLabel || label).toBeTruthy();
      }
    });

    test('should have proper image alt text', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        const ariaLabel = await image.getAttribute('aria-label');
        
        // Images should have alt text or aria-label
        expect(alt !== null || ariaLabel !== null).toBeTruthy();
      }
    });

    test('should have proper button labels', async ({ page }) => {
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        
        expect(text?.trim() || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Color Contrast and Visual Design', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      // Check background and text colors
      const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a').all();
      
      for (const element of textElements.slice(0, 10)) { // Check first 10 elements
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize