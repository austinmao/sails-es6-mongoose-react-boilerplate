/**
* Utils
*
* @description :: utilities service
* @docs        :: http://sailsjs.org/#!documentation/services
*/

import _ from 'lodash'
import Promise from 'bluebird'
import is from 'is_js'
import changeCase from 'change-case'
import geoJsonValidation from 'geojson-validation'
import util from 'util'
import humps from 'humps' // camel case nested object keys
import flatten from 'flat' // flatten nested object
import _s from 'underscore.string'
import Downloader from 'download'

// color consoles
import chalk from 'chalk'
const success = chalk.bgGreen.black
const failure = chalk.bgRed.black
const trace = chalk.bgBlue.black


const sails = {
  log: console.log
}
const log = console.log


export class Generate {

  constructor(obj) {
    this.obj = obj
  }


  /**
   * generate cartesian product from unique arguments
   * @return {[[object]]} returns array of arrays
   */
  cartesianProduct(obj) {
    return _.reduce(obj, function(a, b) {
      return _.flatten(_.map(a, function(x) {
        return _.map(b, function(y) {
          return x.concat([y]);
        });
      }), false);
    }, [ [] ]);
  }


  /**
   * generate array of permutations of an object by one key of the object
   * @param  {[type]} obj [description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  permutationsOfObjectByValuesInKey(obj, key) {
    let perms = [] // permutations to return
    let perm       // each permutation
    const variations = _.get(obj, key)

    if (is.not.array(variations)) return new Error('key is not an array')

    // clone obj for permutation then set the value at key
    for (const val of variations) {
      perm = _.cloneDeep(obj)
      _.set(perm, key, val)
      perms.push(perm)
    }

    sails.log(perms)
    return perms
  }


  /**
   * generate cartesian product of permutations of object by varying keys
   * @param  {object} obj - obj with keys with varying values
   * @return {[type]}     [description]
   */
  permutationsOfObjectByKeyValueVariations(obj, keys) {
    let perm
    let perms = []
    let permsOfPerms = []

    if (is.not.array(keys)) {
      if (is.string(keys)) keys = [keys]
      else return new Error('keys needs to be in an array')
    }

    // create array of objects
    let i = 0
    for (const key of keys) {
      sails.log('finding permutation of key', key)
      perm = this.permutationsOfObjectByValuesInKey(_.pick(obj, key), key)
      if (is.error(perm)) return perm

      sails.log('permutation found is', perm)
      perms.push(perm)
      log('in loop', ++i, perms)
    }

    sails.log('going to find cartesianProduct of', util.inspect(perms, { showHidden: false, depth: null }))
    sails.log('wwwwwwwwwwwwwwwwwwtf')
    const cart = this.cartesianProduct(perms)
    sails.log(cart)
  }
} // Generate

let obj, result, generate

obj = [
  [1,2],
  ['a','b']
]

generate = new Generate()
result = generate.cartesianProduct(obj)
log('normal', result)

///////////

obj = {
  a: [1, 2],
  b: ['z', 'x']
}

generate = new Generate()
result = generate.permutationsOfObjectByKeyValueVariations(obj, ['a', 'b'])
log('before flatten', result)
result = _.flatten(result)
log('after flatten', result)
