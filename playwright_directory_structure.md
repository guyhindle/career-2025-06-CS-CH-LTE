# Playwright TypeScript Project Directory Structure

``` text
restful-booker-tests/
├── package.json
├── package-lock.json
├── tsconfig.json
├── playwright.config.ts
├── .gitignore
├── README.md
├── tests/
│   ├── ui/
│   │   ├── homepage.spec.ts
│   │   ├── booking.spec.ts
│   │   ├── contact.spec.ts
│   │   └── responsive.spec.ts
│   ├── api/
│   │   ├── rooms.spec.ts
│   │   ├── booking.spec.ts
│   │   └── contact.spec.ts
│   └── e2e/
│       ├── full-booking-flow.spec.ts
│       └── contact-flow.spec.ts
├── pages/
│   ├── base.page.ts
│   ├── homepage.page.ts
│   ├── booking.page.ts
│   └── contact.page.ts
├── fixtures/
│   ├── test-data.ts
│   └── api-data.ts
├── utils/
│   ├── helpers.ts
│   ├── constants.ts
│   └── date-utils.ts
├── test-results/
├── playwright-report/
└── screenshots/
```

## File Contents and Purpose

### Root Level Configuration Files

#### `package.json`

```json
{
  "name": "restful-booker-tests",
  "version": "1.0.0",
  "description": "Playwright tests for Restful Booker Platform",
  "main": "index.js",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report",
    "test:codegen": "playwright codegen https://automationintesting.online"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "typescript": "^5.0.0"
  }
}
```

#### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "@playwright/test"]
  },
  "include": ["tests/**/*", "pages/**/*", "utils/**/*", "fixtures/**/*"],
  "exclude": ["node_modules", "dist", "test-results", "playwright-report"]
}
```

#### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'https://automationintesting.online',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

#### `.gitignore`

``` text
node_modules/
test-results/
playwright-report/
playwright/.cache/
screenshots/
videos/
traces/
dist/
*.log
.env
```

### Page Object Model (POM) Files

#### `pages/base.page.ts`

```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
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
}
```

#### `pages/homepage.page.ts`

```typescript
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
```

### Test Data and Fixtures

#### `fixtures/test-data.ts`

```typescript
export const testUsers = {
  validUser: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '01234567890'
  },
  invalidUser: {
    firstName: '',
    lastName: '',
    email: 'invalid-email',
    phone: ''
  }
};

export const contactData = {
  valid: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '01234567890',
    subject: 'Test Subject',
    message: 'This is a test message for the contact form.'
  },
  invalid: {
    name: '',
    email: 'invalid-email',
    phone: '',
    subject: '',
    message: ''
  }
};
```

### Utility Files

#### `utils/constants.ts`

```typescript
export const TIMEOUTS = {
  DEFAULT: 5000,
  LONG: 10000,
  NETWORK: 30000
};

export const URLS = {
  BASE: 'https://automationintesting.online',
  ROOM_API: 'https://automationintesting.online/room/',
  BOOKING_API: 'https://automationintesting.online/booking/',
  MESSAGE_API: 'https://automationintesting.online/message/'
};

export const SELECTORS = {
  BOOKING_MODAL: '.room-booking-form',
  CALENDAR: '.rbc-calendar',
  CONTACT_FORM: '.contact',
  SUCCESS_MESSAGE: '.alert-success',
  ERROR_MESSAGE: '.alert-danger'
};
```

### Test Organization

#### `tests/ui/homepage.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homepage.page';

test.describe('Homepage Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto('/');
    
    await expect(homePage.title).toContainText('Welcome to Restful Booker Platform');
    await expect(homePage.hotelLogo).toBeVisible();
  });
});
```

### Example Commands

#### Setup Commands

```bash
# Initialize project
npm init -y

# Install dependencies
npm install -D @playwright/test typescript

# Install browsers
npx playwright install

# Generate initial test
npx playwright codegen https://automationintesting.online
```

#### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/ui/homepage.spec.ts

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Debug tests
npm run test:debug

# Generate and view report
npm run test:report
```

## Best Practices Implemented

1. **Separation of Concerns**: UI tests, API tests, and E2E tests in separate folders
2. **Page Object Model**: Reusable page classes for better maintainability
3. **Test Data Management**: Centralized test data in fixtures
4. **Configuration Management**: Comprehensive Playwright configuration
5. **Utility Functions**: Common helpers and constants
6. **Proper TypeScript Setup**: Type safety and modern JavaScript features
7. **CI/CD Ready**: Configuration suitable for continuous integration
8. **Reporting**: Multiple report formats for different needs
9. **Cross-browser Testing**: Multiple browser configurations
10. **Mobile Testing**: Responsive design testing setup

This structure provides a solid foundation for scaling your test suite and maintaining it effectively.
