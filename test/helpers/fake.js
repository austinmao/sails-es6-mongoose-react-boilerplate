/**
* fakeUser.js
*
* @description :: class to generate fake user data for unit tests
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

import _ from 'lodash'
import faker from 'faker'
const User = require('../../api/models/User')
import {Generate} from '../../api/services/Utils'
const generate = new Generate()


/**
 * generate fake data
 */
export class Fake {

  user() {
    return {
      email: faker.internet.email(),
    }
  }
} // class


// const fake = new Fake()
// console.log('fakeUser:', fake.user())
// console.log('fakePlace:', fake.place())
