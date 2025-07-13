import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly title: Locator;
  readonly hotelLogo: Locator;
  readonly hotelDescription: Locator;
  readonly contactSection: Locator;
  readonly roomInfo: Locator;
  readonly bookingButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1');
    this.hotelLogo = page.locator('.hotel-logoUrl');
    this.hotelDescription = page.locator('.hotel-description');
    this.contactSection = page.locator('.contact');
    this.roomInfo = page.locator('.room-info');
    this.bookingButtons = page.locator('.openBooking');
  }

  async openFirstBookingModal() {
    await this.bookingButtons.first().click();
  }
}