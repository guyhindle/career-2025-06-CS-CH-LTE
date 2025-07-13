import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the Booking Page
 */
export class BookingPage extends BasePage {
  // Booking form elements
  readonly bookingForm: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly checkinDateInput: Locator;
  readonly checkoutDateInput: Locator;
  readonly bookingButton: Locator;
  readonly cancelButton: Locator;
  
  // Room selection elements
  readonly roomTypeDropdown: Locator;
  readonly roomPriceDisplay: Locator;
  readonly roomImageDisplay: Locator;
  readonly roomDescriptionDisplay: Locator;
  
  // Booking summary elements
  readonly bookingSummary: Locator;
  readonly totalPriceDisplay: Locator;
  readonly bookingDatesDisplay: Locator;
  readonly guestInfoDisplay: Locator;
  
  // Messages and notifications
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly validationErrors: Locator;
  readonly loadingSpinner: Locator;
  
  // Booking management elements
  readonly bookingsList: Locator;
  readonly editBookingButton: Locator;
  readonly deleteBookingButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page, '/');
    
    // Initialize locators with fallback selectors
    this.bookingForm = page.locator('[data-testid="booking-form"]').or(page.locator('form')).first();
    this.firstNameInput = page.locator('input[name="firstname"]').or(page.locator('#firstname')).first();
    this.lastNameInput = page.locator('input[name="lastname"]').or(page.locator('#lastname')).first();
    this.emailInput = page.locator('input[name="email"]').or(page.locator('#email')).first();
    this.phoneInput = page.locator('input[name="phone"]').or(page.locator('#phone')).first();
    this.checkinDateInput = page.locator('input[name="checkin"]').or(page.locator('#checkin')).first();
    this.checkoutDateInput = page.locator('input[name="checkout"]').or(page.locator('#checkout')).first();
    this.bookingButton = page.locator('button:has-text("Book")').or(page.locator('#book-room')).first();
    this.cancelButton = page.locator('button:has-text("Cancel")').or(page.locator('#cancel-booking')).first();
    
    // Room selection elements
    this.roomTypeDropdown = page.locator('select[name="roomtype"]').or(page.locator('#roomtype')).first();
    this.roomPriceDisplay = page.locator('[data-testid="room-price"]').or(page.locator('.room-price')).first();
    this.roomImageDisplay = page.locator('[data-testid="room-image"]').or(page.locator('.room-image')).first();
    this.roomDescriptionDisplay = page.locator('[data-testid="room-description"]').or(page.locator('.room-description')).first();
    
    // Booking summary elements
    this.bookingSummary = page.locator('[data-testid="booking-summary"]').or(page.locator('.booking-summary')).first();
    this.totalPriceDisplay = page.locator('[data-testid="total-price"]').or(page.locator('.total-price')).first();
    this.bookingDatesDisplay = page.locator('[data-testid="booking-dates"]').or(page.locator('.booking-dates')).first();
    this.guestInfoDisplay = page.locator('[data-testid="guest-info"]').or(page.locator('.guest-info')).first();
    
    // Messages and notifications
    this.successMessage = page.locator('.alert-success').or(page.locator('.success-message')).first();
    this.errorMessage = page.locator('.alert-danger').or(page.locator('.error-message')).first();
    this.validationErrors = page.locator('.validation-error').or(page.locator('.field-error'));
    this.loadingSpinner = page.locator('.loading').or(page.locator('.spinner')).first();
    
    // Booking management elements
    this.bookingsList = page.locator('[data-testid="bookings-list"]').or(page.locator('.bookings-list')).first();
    this.editBookingButton = page.locator('button:has-text("Edit")').or(page.locator('.edit-booking')).first();
    this.deleteBookingButton = page.locator('button:has-text("Delete")').or(page.locator('.delete-booking')).first();
    this.confirmDeleteButton = page.locator('button:has-text("Confirm")').or(page.locator('#confirm-delete')).first();
  }

  /**
   * Fill booking form with guest information
   */
  async fillBookingForm(bookingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    checkinDate: string;
    checkoutDate: string;
  }): Promise<void> {
    await this.fillInput(this.firstNameInput, bookingData.firstName);
    await this.fillInput(this.lastNameInput, bookingData.lastName);
    await this.fillInput(this.emailInput, bookingData.email);
    await this.fillInput(this.phoneInput, bookingData.phone);
    await this.fillInput(this.checkinDateInput, bookingData.checkinDate);
    await this.fillInput(this.checkoutDateInput, bookingData.checkoutDate);
  }

  /**
   * Select room type from dropdown
   */
  async selectRoomType(roomType: string): Promise<void> {
    await this.selectOption(this.roomTypeDropdown, roomType);
  }

  /**
   * Submit booking form
   */
  async submitBooking(): Promise<void> {
    await this.clickElement(this.bookingButton);
  }

  /**
   * Cancel booking form
   */
  async cancelBooking(): Promise<void> {
    await this.clickElement(this.cancelButton);
  }

  /**
   * Create a complete booking
   */
  async createBooking(bookingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    checkinDate: string;
    checkoutDate: string;
    roomType?: string;
  }): Promise<void> {
    await this.fillBookingForm(bookingData);
    
    if (bookingData.roomType) {
      await this.selectRoomType(bookingData.roomType);
    }
    
    await this.submitBooking();
  }

  /**
   * Get booking success message
   */
  async getSuccessMessage(): Promise<string> {
    // await this.waitForElement(this.successMessage);
    return await this.getTextContent(this.successMessage);
  }

  /**
   * Get booking error message
   */
  async getErrorMessage(): Promise<string> {
    // await this.waitForElement(this.errorMessage);
    return await this.getTextContent(this.errorMessage);
  }

  /**
   * Get all validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorElements = await this.validationErrors.all();
    
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text) {
        errors.push(text);
      }
    }
    
    return errors;
  }

  /**
   * Check if booking form is visible
   */
  async isBookingFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.bookingForm);
  }

  /**
   * Get room price
   */
  async getRoomPrice(): Promise<string> {
    return await this.getTextContent(this.roomPriceDisplay);
  }

  /**
   * Get total booking price
   */
  async getTotalPrice(): Promise<string> {
    return await this.getTextContent(this.totalPriceDisplay);
  }

  /**
   * Get booking dates display
   */
  async getBookingDates(): Promise<string> {
    return await this.getTextContent(this.bookingDatesDisplay);
  }

  /**
   * Get guest information display
   */
  async getGuestInfo(): Promise<string> {
    return await this.getTextContent(this.guestInfoDisplay);
  }

  /**
   * Check if booking summary is visible
   */
  async isBookingSummaryVisible(): Promise<boolean> {
    return await this.isElementVisible(this.bookingSummary);
  }

  /**
   * Wait for booking to be processed
   */
  // async waitForBookingProcessing(): Promise<void> {
  //   // Wait for loading spinner to appear and disappear
  //   if (await this.isElementVisible(this.loadingSpinner)) {
  //     await this.waitForElementToBeHidden(this.loadingSpinner);
  //   }
    
  //   // Wait for either success or error message
  //   await Promise.race([
  //     this.waitForElement(this.successMessage),
  //     this.waitForElement(this.errorMessage)
  //   ]);
  // }

  /**
   * Validate booking form fields
   */
  async validateBookingForm(): Promise<{
    firstNameValid: boolean;
    lastNameValid: boolean;
    emailValid: boolean;
    phoneValid: boolean;
    checkinDateValid: boolean;
    checkoutDateValid: boolean;
  }> {
    // Try to submit empty form to trigger validation
    await this.submitBooking();
    
    return {
      firstNameValid: await this.firstNameInput.getAttribute('aria-invalid') !== 'true',
      lastNameValid: await this.lastNameInput.getAttribute('aria-invalid') !== 'true',
      emailValid: await this.emailInput.getAttribute('aria-invalid') !== 'true',
      phoneValid: await this.phoneInput.getAttribute('aria-invalid') !== 'true',
      checkinDateValid: await this.checkinDateInput.getAttribute('aria-invalid') !== 'true',
      checkoutDateValid: await this.checkoutDateInput.getAttribute('aria-invalid') !== 'true'
    };
  }

  /**
   * Edit existing booking
   */
  async editBooking(bookingId: string, updatedData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    checkinDate?: string;
    checkoutDate?: string;
  }): Promise<void> {
    // Navigate to booking or find booking in list
    const bookingRow = this.page.locator(`[data-booking-id="${bookingId}"]`);
    await this.clickElement(bookingRow.locator(this.editBookingButton));
    
    // Update fields if provided
    if (updatedData.firstName) {
      await this.fillInput(this.firstNameInput, updatedData.firstName);
    }
    if (updatedData.lastName) {
      await this.fillInput(this.lastNameInput, updatedData.lastName);
    }
    if (updatedData.email) {
      await this.fillInput(this.emailInput, updatedData.email);
    }
    if (updatedData.phone) {
      await this.fillInput(this.phoneInput, updatedData.phone);
    }
    if (updatedData.checkinDate) {
      await this.fillInput(this.checkinDateInput, updatedData.checkinDate);
    }
    if (updatedData.checkoutDate) {
      await this.fillInput(this.checkoutDateInput, updatedData.checkoutDate);
    }
    
    await this.submitBooking();
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<void> {
    const bookingRow = this.page.locator(`[data-booking-id="${bookingId}"]`);
    await this.clickElement(bookingRow.locator(this.deleteBookingButton));
    await this.clickElement(this.confirmDeleteButton);
  }

  /**
   * Get list of all bookings
   */
  async getBookingsList(): Promise<Array<{
    id: string;
    guestName: string;
    dates: string;
    roomType: string;
  }>> {
    const bookings: Array<{
      id: string;
      guestName: string;
      dates: string;
      roomType: string;
    }> = [];
    
    const bookingRows = await this.bookingsList.locator('tr').all();
    
    for (const row of bookingRows) {
      const id = await row.getAttribute('data-booking-id') || '';
      const guestName = await row.locator('.guest-name').textContent() || '';
      const dates = await row.locator('.booking-dates').textContent() || '';
      const roomType = await row.locator('.room-type').textContent() || '';
      
      if (id) {
        bookings.push({ id, guestName, dates, roomType });
      }
    }
    
    return bookings;
  }
}