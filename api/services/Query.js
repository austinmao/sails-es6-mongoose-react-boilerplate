/**
 * Query Service
 *
 * @description :: Calculate changes in score
 * @help        :: See http://links.sailsjs.org/docs/services
 */

import Promise from 'bluebird'
import _ from 'lodash'
import is from 'is_js'
import changeCase from 'change-case'
import {Validate, Convert, Generate} from './Utils'
import geoJsonValidation from 'geojson-validation'
import mongoose from 'mongoose'
import objectId from 'objectid'
const ObjectId = require('mongodb').ObjectID


// custom logger
import {Log} from './Log'
let logLevels = {
  constructQuery: 'debug',
  addFilterByArrayToQuery: 'debug',
  convertStringsArrayToObjectIds: 'debug',
  near: 'debug',
  many: 'debug',
  manyByIds: 'debug'
}


export class Find {

  constructor(model, filters) {
    const fn = 'Query.Find'
    if (!model) return new Error(fn + ' has no model')

    this.model   = model
    this.filters = filters
  }


  /**
   * construct filters query
   * @example:
     const find = new Query.Find(User, filters)
     return find.manyByIds('_id', ids)

   * @return {object} query to filter by
   */
  constructQuery(filters) {

    const fn = 'constructQuery'; const log = new Log(fn, logLevels[fn])

    filters = filters || this.filters

    // construct geo query
    let query = {}

    // add types to query if it is present
    if (filters) {
      if (is.not.array(filters)) {
        return new Error('filters need to be in an array: ', filters)
      }

      // add filters to query
      for (const filter of filters) {

        // return if not object in filter
        if (is.not.object(filter)) return new Error('filter is not an object: ' + filter)

        // extend query with filter
        query = _.extend(query, filter)
      } // for
    } // if

    return query
  }


  /**
   * construct an $in mongo query to match values in an array
   * @param {object[]} filters - array of filters
   * @example: [ {'_id': ['abc', 'def']} ]
   * 
   * @return {object} mongo query options
   */
  addFilterByArray(filters) {

    const fn = 'addFilterByArrayToQuery'; const log = new Log(fn, logLevels[fn])

    filters = filters || this.filters

    // return if no array is passed
    if (is.not.array(filters)) {
      return new Error('filters need to be in an array: ', filters)
    }

    // if there is no this.filters, set it to empty array
    if (!this.filters || is.not.object(this.filters)) {
      this.filters = []
    }

    let _filter = {}
    let _filters = _.cloneDeep(this.filters)

    // create $in mongo queries for passed in filters
    for (const filter of filters) {

      // add $in filter to query if the filter value is an array
      for (const key in filter) {

        // add $in this.filters
        if (is.array(filter[key])) {

          // add $in to this.filters
          _filter[key] = { $in: filter[key] }
          _filters.push(_filter)

        } else if (is.object(filter)) {

          // just extend obj if not array but is object
          _filters.push(filter)
        } // if, else
      } // for
    } // for

    return _filters
  }


  /**
   * convert array of string ids to BSON objectIds
   * @param  {string[]} array - array of string ids
   * @return {object[]}         array of ObjectIds
   */
  convertStringsArrayToObjectIds(array) {

    const fn = 'convertStringsArrayToObjectIds'; const log = new Log(fn, logLevels[fn])

    // map array of strings
    return _.map(array, str => {

      // if already objectId, continue to next
      if (objectId.isValid(str) && is.not.string(str)) return str

      // convert strings to object id
      return new ObjectId(str)
    })
  }


  /**
   * Search models based on location
   * @param {object}   indexKey        - key where 2dsphereindex is located
   * @param {object}   location        - origin as a geoPoint
   * @param {float}    radius          - radius in meters around geoJson to search for
   * @param {number}   limitResultsCnt - number of results to return
   * @return {object[]}                  db find results
   */
  near(indexKey, location, radius, limitResultsCnt) {

    const fn = 'near'; const log = new Log(fn, logLevels[fn])
    // log.trace('params', {location, radius, limitResultsCnt})
   
    // return error if not properly formatted geojson
    if (!geoJsonValidation.valid(location)) {
      return new Error('location is not a geoJson object')
    }

    // construct search options
    const distanceMultiplier = 6378137 // converts radians to meters (=== 1/6371000)

    // construct geo query
    let query = this.constructQuery()

    // set the key of the 2dSphereIndex for the $near search to search by
    query[indexKey] = {
      '$near': location,
      '$distanceMultiplier': distanceMultiplier
    }

    // set maxDistance to radius if radius
    if (radius) {
      query[indexKey]['$maxDistance'] = radius
    }

    // log.trace('going to findAsync with', query)
    return this.model.mongoose.findAsync(query)
      // .tap(result => log.success('success with count:', result.length))

      .catch(err => {
        sails.log.error(fn, 'error', err)
        throw new Promise.OperationalError(err)
      })
  } // search


  /**
   * find many by filter
   * @return {object[]} - array of found records
   */
  many(filters) {

    const fn = 'many'; const log = new Log(fn, logLevels[fn])

    filters = filters || this.filters

    // construct geo query
    let query = this.constructQuery(filters)

    // log.trace('going to findAsync with', query)
    return this.model.mongoose.findAsync(query)
      .tap(result => log.success(fn, 'success with count:', result.length))

      .catch(err => {
        sails.log.error(fn, 'error', err)
        // TODO: should this be Promise.OperationalError?
        throw new Promise.OperationalError(err)
      })
  }


  removeMany(filters) {

    const fn = 'removeMany'; const log = new Log(fn, logLevels[fn])

    filters = filters || this.filters

    // construct geo query
    let query = this.constructQuery(filters)

    log.trace('going to removeAsync with', query)
    return this.model.mongoose.removeAsync(query)
      .tap(result => log.success(fn, 'success with count:', result.length))

      .catch(err => {
        sails.log.error(fn, 'error', err)
        // TODO: should this be Promise.OperationalError?
        throw new Promise.OperationalError(err)
      })
    }


  /**
   * find array of documents by ids at indexKey
   * @param  {string}                 idKey - flat nested object key. e.g., 'history.place._placeId'
   * @param  {string[] || objectId[]} ids   - array of objectIds
   * @return {object[]}                       array of matching docs
   */
  manyByIds(idKey, ids) {

    const fn = 'manyByIds'; const log = new Log(fn, logLevels[fn])
    // log.trace('params', {idKey, ids})

    // construct geo query
    let query = this.constructQuery()

    // search for ids in idKey
    query[idKey] = {
      $in: ids
    }
   
    // // TODO: DRY this up using this.convertStringsArrayToObjectIds
    // // convert strings to array for each array of ids in idsKeyValuePair.
    // // there should only be one key
    // let _ids
    // for (const key in idsKeyValuePair) {
    //     _ids = idsKeyValuePair[key]

    //   // return error if not properly formatted geojson
    //   if (is.not.array(_ids)) {
    //     return new Error('ids is not an array')
    //   }

    //   // convert ids to objectIds if not already objectIds
    //   idsKeyValuePair[key] = this.convertStringsArrayToObjectIds(_ids)
    // }

    // query = this.addFilterByArrayToQuery(query, idsKeyValuePair)

    // log.trace('going to findAsync with', query)
    return this.model.mongoose.findAsync(query)
      // .tap(result => log.success('success with count:', result.length))

      .catch(err => {
        sails.log.error(fn, 'error', err)
        throw new Promise.OperationalError(err)
      })
  }
}


export class Populate extends Find {

  constructor(model, filters) {
    super(model, filters)
  }


}