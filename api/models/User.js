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


let schema = new mongoose.Schema({

  email: String
});


exports.schema = schema
