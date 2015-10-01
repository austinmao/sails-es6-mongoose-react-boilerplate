/**
* crud.js
*
* @description :: helper to test Mongoose and Waterline CRUD functions
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

import _ from 'lodash'
import Promise from 'bluebird'

// color consoles
import chalk from 'chalk'
const success = chalk.bgGreen.black
const failure = chalk.bgRed.black


export class MongooseCrud {
  constructor(model) {
    this.Model = model
  }

  create(data) {
    return this.Model.mongoose.createAsync(data)
  }

  read(id) {
    return this.Model.mongoose.findByIdAsync(id)
  }

  update(id, data) {
    // find record by id
    return this.Model.mongoose.findByIdAsync(id)
      // .tap(result => sails.log(success('find record success'), result))

      // add values to record then save
      .then(record => {
        if (!record) throw Error('not found')

        return _.merge(record, data, { updatedAt: Date.now() })
      })
      // .tap(result => sails.log(success('merge record success'), result))

      // save record
      .then(record => record.saveAsync())
      // .tap(result => sails.log(success('update record success'), result))
  }

  destroy(id) {
    return this.Model.mongoose.findByIdAndRemoveAsync(id)
  }
}