/**
 * /api/blueprints/create.js
 *
 * @description :: Server-side logic for create blueprint (post routes)
 * @help        :: See http://links.sailsjs.org/docs/blueprints
 */

import actionUtil from 'sails/lib/hooks/blueprints/actionUtil'
import changeCase from 'change-case'
import Promise from 'bluebird'
import {Validate} from '../services/Utils'
import is from 'is_js'
import flatten from 'flat' // flatten nested object
import util from 'util'

// color consoles
import chalk from 'chalk'
const success = chalk.bgGreen.black
const failure = chalk.bgRed.black
const trace = chalk.bgBlue.black

// custom logger
import {Log} from '../services/Log'
let fn
let logLevels = {
  createRecord: 'warn',
}
let log


/**
 * post /:modelIdentity
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified criteria.  If an id was specified, just the instance with
 * that unique id will be returned.
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 * @param {*} * - other params will be used as `values` in the create
 */
module.exports = function createRecord(req, res) {

  fn = 'createRecord'; log = new Log(fn, logLevels[fn])
  sails.log.verbose('in', fn, 'with req.body', req.body)

  // Create data object (monolithic combination of all parameters)
  // Omit the blacklisted params (like JSONP callback param, etc.)
  const data = actionUtil.parseValues(req);

  // get mongoose model
  let Model = actionUtil.parseModel(req)

  // create if no validation criterion; createOrUpdate if validators exist
  if (!data.validate || is.empty(data.validate)) {
    _create()
  } else {
    _createOrUpdate()
  }


  /**
   * create a record
   * @return {promise} [mongoose create promise result]
   */
  function _create() {

    // create record with data
    return Model.mongoose.createAsync(data)
      .tap(result => sails.log.info(success(fn, 'create success:'), result))
      // Send JSONP-friendly response if it's supported
      .then(res.created)

      // Differentiate between waterline-originated validation errors
      // and serious underlying issues. Respond with badRequest if a
      // validation error is encountered, w/ validation info.
      .catch(res.negotiate)
  } // _create


  /**
   * update a record
   * @example
    {
     "validate": [
        {
          "property": {
            "auth": {
              "facebook": {
                "id": 10103058011108054
              }
            }
          },
          "action": "update",
          "limit": 1
        }
      ]
    }
   * @return {object or array} [object if single record was created or updated; array if multiple objects were created or updated]
   */
  function _createOrUpdate() {

    // map array of validators to check if matching records exist
    return Promise.map(data.validate, validateBy => {
      // flatten json object for findAsync to match that specific attribute
      validateBy = flatten(validateBy.property)

      // find by property of validator. this will return an array.
      return Model.mongoose.findAsync(validateBy)
        // .tap(result => sails.log(trace('found matching records by property'), result))

        // create new record with data if no records at all; update each
        // record if records found
        .then(records => {
          
          // create record if none are found
          if (!records || is.empty(records)) {
            return _create()
          } else { // update one record if one is found

            if (records.length === 1) {
              return __updateOneRecord(records[0])
                // res results
                .then(results => res.status(200).jsonp(results))
                // .catch(res.negotiate)
            } else { // update multiple records if multiple are found

              return __updateMultipleRecords(records)
                // res results
                .then(results => res.status(200).jsonp(results))
                .catch(res.negotiate)
            } // if, else
          } // if, else

        }) // .then
    }) // return Model.mongoose.findAsync(validateBy.property)


    /**
     * update one record
     * @param  {object} record [found record from db]
     * @return {promise}       [fulfilled promise]
     */
    function __updateOneRecord(record) {

      fn = '__updateOneRecord'; log = new Log(fn, logLevels[fn])

      // omit validation and add update data
      record = __cleanAndMergeUpdates(record, data)

      return record.saveAsync()
        .then(result => result[0])
        .tap(result => sails.log.info(fn, 'success with record count:', result.length))
    } // __updateOneRecord


    /**
     * update multiple records if they are found
     * @param  {object} records [found records from db]
     * @return {promise}        [fulfilled promise]
     */
    function __updateMultipleRecords(records) {

      fn = '__updateMultipleRecords'; log = new Log(fn, logLevels[fn])

      // remove falsies if they exist
      records = _.compact(records)
      // limit records
      records = records.slice(0, data.validate.limit)
      // sails.log('records to map', records)

      // extend each record with data and save
      return Promise.map(records, record => {
        return __updateOneRecord(record)
      })
        .tap(result => sails.log.info(fn, 'success with record count:', result.length))
    } // __updateMultipleRecords


    /**
     * remove validate object and add updatedAt timestamp, then merge updates
     * @param  {object} record [original found record from db]
     * @param  {object} data   [original update data]
     * @return {object}        [updated record after clean and merge]
     */
    function __cleanAndMergeUpdates(record, data) {
      // omit validation data on the object
      const update = _.omit(data, 'validate')

      // TODO: check if having _id causes a save problem
      return _.merge(record, update, { updatedAt: Date.now() })
    } // __cleanAndMergeUpdates
  } // _createOrUpdate
};

/*****************************
* TODO: add pubsub hook back *
***************************//*

// If we have the pubsub hook, use the model class's publish method
// to notify all subscribers about the created item
if (req._sails.hooks.pubsub) {
  if (req.isSocket) {
    Model.subscribe(req, newInstance);
    Model.introduce(newInstance);
  }
  Model.publishCreate(newInstance.toJSON(), !req.options.mirror && req);
}
*/
