/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

import _ from 'lodash'
import Promise from 'bluebird'
import is from 'is_js'
import mongoose from 'mongoose'


// set discriminator key for polymorphic schema
// @see http://thecodebarbarian.com/2015/07/24/guide-to-mongoose-discriminators
// @see http://mongoosejs.com/docs/discriminators.html
const options = {
  discriminatorKey: 'type'
}


let schema = new mongoose.Schema({

  firstName: String,
  lastName: String,
  email: String
}, options);


let facebookSchema = new mongoose.Schema({
  username: String
}, options)

let twitterSchema = new mongoose.Schema({
  handle: String
}, options)


exports.discriminators = [
  { name: 'Facebook', schema: facebookSchema },
  { name: 'Twitter', schema: twitterSchema }
]


exports.schema = schema
