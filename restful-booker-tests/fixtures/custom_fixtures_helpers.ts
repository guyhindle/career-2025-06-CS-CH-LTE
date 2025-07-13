// fixtures/booking-data.ts
import { faker } from '@faker-js/faker';

export const bookingTestData = {
  businessUser: {
    firstName: 'Business',
    lastName: 'Traveler',
    email: 'business@company.com',
    phone: '02087654321'
  },
  internationalUser: {
    firstName: 'International',
    lastName: 'Guest',
    email: 'guest@international.com',
    phone: '+44 20 7946 0958'
  },
  generateRandomBooking: () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    // phone: faker.phone.number('###########'),
    email: faker.internet.email()
  }),
}