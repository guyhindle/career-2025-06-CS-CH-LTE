// fixtures/test-data.ts
import { faker } from '@faker-js/faker';

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
  },
  longNameUser: {
    firstName: 'A'.repeat(100),
    lastName: 'B'.repeat(100),
    email: 'test@example.com',
    phone: '01234567890'
  },
  specialCharUser: {
    firstName: 'José-María',
    lastName: "O'Connor",
    email: 'jose.maria@example.com',
    phone: '01234567890'
  },
  randomUser: () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    // phone: faker.phone.number('###########'),
    email: faker.internet.email()
  })
};