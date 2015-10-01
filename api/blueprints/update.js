/**
 * /api/blueprints/update.js
 *
 * @description :: Server-side logic for update blueprint (post routes)
 * @help        :: See http://links.sailsjs.org/docs/blueprints
 */

import _ from 'lodash'
import Promise from 'bluebird'
import actionUtil from 'sails/lib/hooks/blueprints/actionUtil'
import util from 'util' // TODO: check if this is necessary


// custom logger
import {Log} from '../services/Log'
let fn
let logLevels = {
  updateOneRecord: 'warn'
}
let log


/**
 * Update One Record
 *
 * An API call to update a model instance with the specified `id`,
 * treating the other unbound parameters as attributes.
 *
 * @param {Integer|String} id  - the unique id of the particular record you'd like to update  (Note: this param should be specified even if primary key is not `id`!!)
 * @param *                    - values to set on the record
 *
 */
module.exports = function updateOneRecord(req, res) {

  fn = 'updateOneRecord'; log = new Log(fn, logLevels[fn])
  sails.log.verbose('in', fn, 'with req.body', req.body)

  // Look up the model
  let Model = actionUtil.parseModel(req);

  // Locate and validate the required `id` parameter.
  const pk = actionUtil.requirePk(req);

  // Create `values` object (monolithic combination of all parameters)
  // But omit the blacklisted params (like JSONP callback param, etc.)
  const values = actionUtil.parseValues(req);

  // Omit the path parameter `id` from values, unless it was explicitly defined
  // elsewhere (body/query):
  const idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
  if (!idParamExplicitlyIncluded) delete values.id;

  // No matter what, don't allow changing the PK via the update blueprint
  // (you should just drop and re-add the record if that's what you really want)
  if (typeof values[Model.primaryKey] !== 'undefined') {
    sails.log.warn('Cannot change primary key via update blueprint; ignoring value sent for `' + Model.primaryKey + '`');
  }
  delete values[Model.primaryKey];

  // find record by id
  Model.mongoose.findByIdAsync(pk)

    // add values to record then save
    .then(record => {
      if (!record) throw Promise.OperationalError('not found') // skip to catch if no record found
      return _.merge(record, values, { updatedAt: Date.now() })
    })

    // save record
    .then(record => record.saveAsync())
    .tap(result => sails.log.info('update success:', result))

    // res json
    .spread(json => res.json(json))
    .tap(result => sails.log.info(fn, 'success with record count:', result.length))

    // catch record not found
    .error(err => res.notFound())

    // res other errors
    .catch(res.serverError)
};

/*******************************
* what used to be in update.js *
*****************************//*

// Find and update the targeted record.
//
// (Note: this could be achieved in a single query, but a separate `findOne`
//  is used first to provide a better experience for front-end developers
//  integrating with the blueprint API.)
Model.findOne(pk).populateAll().exec(function found(err, matchingRecord) {

  if (err) return res.serverError(err);
  if (!matchingRecord) return res.notFound();

  Model.update(pk, values).exec(function updated(err, records) {

    // Differentiate between waterline-originated validation errors
    // and serious underlying issues. Respond with badRequest if a
    // validation error is encountered, w/ validation info.
    if (err) return res.negotiate(err);

    // Because this should only update a single record and update
    // returns an array, just use the first item.  If more than one
    // record was returned, something is amiss.
    if (!records || !records.length || records.length > 1) {
      req._sails.log.warn(
      util.format('Unexpected output from `%s.update`.', Model.globalId)
      );
    }

    const updatedRecord = records[0];

    // If we have the pubsub hook, use the Model's publish method
    // to notify all subscribers about the update.
    if (req._sails.hooks.pubsub) {
      if (req.isSocket) { Model.subscribe(req, records); }
      Model.publishUpdate(pk, _.cloneDeep(values), !req.options.mirror && req, {
        previous: _.cloneDeep(matchingRecord.toJSON())
      });
    }

    // Do a final query to populate the associations of the record.
    //
    // (Note: again, this extra query could be eliminated, but it is
    //  included by default to provide a better interface for integrating
    //  front-end developers.)
    let Q = Model.findOne(updatedRecord[Model.primaryKey]);
    Q = actionUtil.populateEach(Q, req);
    Q.exec(function foundAgain(err, populatedRecord) {
      if (err) return res.serverError(err);
      if (!populatedRecord) return res.serverError('Could not find record after updating!');
      res.ok(populatedRecord);
    }); // </foundAgain>
  });// </updated>
}); // </found>
*/
