/**
* fakeUser.js
*
* @description :: class to generate fake user data for unit tests
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

import _ from 'lodash'
import faker from 'faker'
const User = require('../../api/models/User')
const Place = require('../../api/models/Place')
import {Generate} from '../../api/services/Utils'
const generate = new Generate()


/**
 * fake user
 * @type {Object}
 */
const userSchema = {
  username: faker.internet.userName(),

  profile: {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    image: faker.internet.url()
  },

  auth: {
    local: {
      email: faker.internet.email(),
      password: faker.internet.password()
    },
    facebook: {
      id: faker.random.uuid(),
      token: faker.random.uuid()
    }
  } // auth
} // schema


/**
 * fake place
 * @type {Object}
 */
const placeSchema = {
  name: faker.company.companyName(),

  types: _.sample(Place.placeTypes),

  address: {
    number: generate.randomIntBetween(1, 99),
    street: faker.address.streetName(),
    unit: faker.address.streetSuffix(),
    locality: faker.address.city(),
    city: faker.address.city(),
    county: faker.address.county(),
    country: faker.address.country(),
    postal: faker.address.zipCode(),
    // simplified: // simplified address without province/state, postal code, or country
  },

  phone: {
    formatted: faker.phone.phoneNumber()
    // international: { type: String }
  },

  website: faker.internet.url(),

  service: {
    google: {
      id: faker.random.uuid(),
      url: faker.internet.url(),
      reference: faker.random.uuid(),
      // details: {},
      rating: generate.randomIntBetween(0, 5),
      /*
      reviews: [{
        aspects: [{
          rating: { type: String },
          type: { type: String }
        }],
        authorName: { type: String }, // TODO: camel case
        authorUrl: { type: String }, // TODO: validate url, camel case
        language: { type: String },
        rating: { type: Number },
        text: { type: String },
        time: { type: Date, set: _epochToDate }
      }]
      */
    }
  }
} // schema


/**
 * generate fake data
 */
export class Fake {

  user() { return userSchema }
  place() { return placeSchema }
} // class


// const fake = new Fake()
// console.log('fakeUser:', fake.user())
// console.log('fakePlace:', fake.place())
