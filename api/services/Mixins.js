/**
 * Mixins
 *
 * @description :: Server-side logic for lodash mixins
 * @help        :: See http://links.sailsjs.org/docs/services
 */

import _ from 'lodash'

/**
 * _.mixin for removing falsy values recursively
 * @param  {object} obj [nested object with falsies]
 * @return {object}     [nested object without falsies]
 */
const deepRemoveFalsies = function(obj) {

  return _.transform(obj, function (o, v, k) {
    if (v && typeof v === 'object') {
      o[k] = _.deepRemoveFalsies(v);
    } else if (v) {
      o[k] = v;
    }
  });
};


/**
 * _.mixin for finding if a key-value pair is present in a nested object
 * @param  {object} items [object to search]
 * @param  {object} attrs [object of key-value pair (cannot be nested)]
 * @return {object}       [key-value pair or undefined if not present]
 */
const findDeepKeyValuePair = function(items, attrs) {

  function match(value) {
    for (var key in attrs) {
      if(!_.isUndefined(value)) {
        if (attrs[key] !== value[key]) {
          return false;
        }
      }
    }
    return true;
  }

  function traverse(value) {
    var result;

    _.forEach(value, function(val) {
      if (match(val)) {
        result = val;
        return false;
      }

      if (_.isObject(val) || _.isArray(val)) {
        result = traverse(val);
      }

      if (result) {
        return false;
      }
    });
    return result;
  }

  return traverse(items);
} // const findDeep


_.mixin(
  { findDeepKeyValuePair },
  { deepRemoveFalsies }
)
