/**
* clean.js
*
* @description :: functions for tearing down db records inserted into the db when unit testing
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

import Promise from 'bluebird'
import is from 'is_js'
import _ from 'lodash'
import changeCase from 'change-case'


/**
 * clean created records in mongoose collection
 */
export class Clean {

  constructor(model) {
    this.model = model
    this.recordCountInDb = 0
    this.recordsToPreserve = []
    this.recordsToTeardown = []
  }


  /**
   * get all records in db
   * @return {object[]} records in db
   */
  findRecords() {
    return this.model.mongoose.findAsync()
  }


  /**
   * count how many records need to be cleaned
   * @return {number} [count of records in db]
   */
  countRecords() {

    return this.findRecords()
      .then(results => {
        this.recordCountInDb = results.length
        return this.recordCountInDb
      })
  }


  /**
   * create array of records to preserve after teardown
   * @return {object[]} records to preserve
   */
  preserveRecords() {

    return this.model.mongoose.findAsync()
      .then(records => {
        for (const record of records) {
          this.recordsToPreserve.push(record._id)
        }
        return this.recordsToPreserve
      })
  }


  /**
   * push to command array of records to destroy
   * @param  {object} record - object id of record to destroy
   * @return {object[]}        records to destroy
   */
  queueRecordToDestroy(record) {

    this.recordsToTeardown.push(record._id)
    return this.recordsToTeardown
  }


  /**
   * return records to destroy
   * @return {object[]} records to destroy
   */
  getRecordsToDestroy() {
    return this.recordsToTeardown
  }


  /**
   * destroy all records in the recordsToTeardown queue
   * @return {promise} [fulfilled promise]
   */
  destroyRecords(records) {

    records = records || this.recordsToTeardown

    // destroy each record to teardown
    return Promise.map(records, _recordId => {
      return this.model.mongoose.findByIdAndRemoveAsync(_recordId)
    })
      .then(() => {
        this.recordsToTeardown = _.difference(this.recordsToTeardown, records)
        return this.recordsToTeardown
      })
      .catch(err => sails.log.error('teardown error:', err))
  }


  /**
   * destroy all records that we don't want to preserve
   * @param  {object[]}  preserveRecords - records to keep
   * @return {promise}                     records to teardown
   */
  teardown(recordsToPreserve) {

    // set recordsToPreserve
    recordsToPreserve = is.empty(recordsToPreserve) ? recordsToPreserve : this.recordsToPreserve

    // find records
    return this.findRecords()
      .then(records => {
        // get record ids only
        records = _.pluck(records, '_id')
        // convert ids to string
        records = _.map(records, record => record.toString())
        recordsToPreserve = _.map(recordsToPreserve, record => record.toString())

        // create array of records to teardown
        let teardown = []
        for (const record of records) {
          if (!_.includes(recordsToPreserve, record)) {
            teardown.push(record)
          }
        }

        return teardown
      })
      .then(records => this.destroyRecords(records))

  }
}


/**
 * describe mocha tests with a beforeAll and afterAll hook to automatically clean and maintain fixtures
 */
export class Describe {

  /**
   * @param  {model} model [lowercase 'model' to clean]
   */
  constructor(model) {
    this.model = model
  }


  /**
   * execute beforeAll and afterAll while cleaning model
   * @param  {string}   name  [describe description]
   * @param  {function} tests [`it` functions to execute]
   */
  cleanly(name, tests) {

    describe(name, () => {

      before(done => {
        this.clean = new Clean(sails.models[this.model])
        this.clean.preserveRecords()
          .then(result => {
            result.length.should.be.eql(fixtures[this.model].length);
            done()
          })
          .catch(done)
      });

      tests();
      
      after(done => {
        this.clean.teardown()
          .then(result => {
            return this.clean.countRecords()
              .then(records => {
                records.should.be.eql(fixtures[this.model].length);
                done()
              })
              .catch(done)
          })
          .catch(done)
      });
    });
  }
}
