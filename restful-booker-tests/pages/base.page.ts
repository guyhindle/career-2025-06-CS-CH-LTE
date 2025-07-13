import { Page, Locator } from '@playwright/test';

// export class BasePage {
//   protected page: Page;

//   constructor(page: Page) {
//     this.page = page;
//   }
export class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }



  /**
   * Navigate to the page
   */
  // async goto(): Promise<void> {
  //   await this.page.goto(this.url);
  //   await this.waitForPageLoad();
  // }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  // async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
  //   await locator.waitFor({ state: 'visible', timeout });
  // }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with retry logic
   */
  async clickElement(locator: Locator, timeout: number = 10000): Promise<void> {
    // await this.waitForElement(locator, timeout);
    await locator.click();
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, value: string, timeout: number = 10000): Promise<void> {
    // await this.waitForElement(locator, timeout);
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator, value: string, timeout: number = 10000): Promise<void> {
    // await this.waitForElement(locator, timeout);
    await locator.selectOption(value);
  }

  /**
   * Get text content of element
   */
  async getTextContent(locator: Locator, timeout: number = 10000): Promise<string> {
    // await this.waitForElement(locator, timeout);
    const text = await locator.textContent();
    return text || '';
  }

  /**
   * Get attribute value of element
   */
  async getAttribute(locator: Locator, attribute: string, timeout: number = 10000): Promise<string> {
    // await this.waitForElement(locator, timeout);
    const value = await locator.getAttribute(attribute);
    return value || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Wait for alert and handle it
   */
  async handleAlert(acceptAlert: boolean = true): Promise<string> {
    return new Promise((resolve) => {
      this.page.on('dialog', async (dialog) => {
        const message = dialog.message();
        if (acceptAlert) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        resolve(message);
      });
    });
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Scroll to element
   */
  // async scrollToElement(locator: Locator): Promise<void> {
  //   await locator.scrollIntoViewIfNeeded();
  // }

}