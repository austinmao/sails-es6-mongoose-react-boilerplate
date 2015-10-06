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


/** exit node process (stops running your file) */
export function x() {
  console.log(
      '\n'
    + '#################### EXITING ########################'
  )
  process.exit(0)
}

/** print deep objects */
export function deepLog(msg, obj) {
  sails.log.warn(msg, util.inspect(obj, { showHidden: true, depth: null }))
}


/**
 * console success or failure messages with colors
 */
export class Log {

  /*
  constructor(fn) {
    this.fn = fn
    this.trace = chalk.bgBlue.black
    this.success = chalk.bgGreen.black
    this.failure = chalk.bgRed.black
  }

  trace(msg, obj) {
    sails.log(this.trace(`${this.fn}: ${msg}`, obj))
  }

  success(msg, obj) {
    sails.log(this.success(`${this.fn}: ${msg} success! :)`, obj))
  }

  failure(msg, obj) {
    sails.log(this.failure(`${this.fn}: ${msg} failure :(`, obj))
  }

  criticalFailure(msg) {
    sails.log.error(this.failure(`${this.fn}: ${msg} failure :*(`, obj))
  }
  */
}


/**
 * validate objects and return true or false if or if not valid
 * @function .geoJson: validate if json is geoJson format
 */
export class Validate {

  constructor(obj) {
    this.obj = obj
  }


  /**
   * check if object has keys. throw error if it does not.
   * @param  {object}    obj  - object to validate
   * @param  {object[]}  keys - keys to check for
   * @return {Boolean}          return error if keys are not validated
   */
  hasKeys(keys, obj) {
    obj = obj || this.obj

    if (!obj || is.empty(obj)) return new Error('object does not exist or is empty')

    // return if no keys to check and obj exists
    if (!keys && obj && is.not.empty(obj)) return true
    
    for (const key of keys) {
      if (!_.has(obj[key])) {
        return new Error(obj.toString() + ' does not have key: ' + key)
      }
    }

    return true
  }


  /**
   * test if array === [String, String]
   * @param  {object[]}   obj - array to test
   * @return {Boolean}          true if double string array
   */
  isDoubleStringArray(obj) {
    const array = obj || this.obj

    return (
         is.array(array)
      && array.length === 2
      && is.string(array[0])
      && is.string(array[1])
    )
  }

  /**
   * test if array === [Number, Number]
   * @param  {object[]} obj - array to test
   * @return {Boolean}        true if double number array
   */
  isDoubleNumberArray(obj) {
    const array = obj || this.obj

    return (
         is.array(array)
      && array.length === 2
      && is.number(array[0])
      && is.number(array[1])
    )
  }

  /** validate if obj is geoPoint with coordinates as double string array (useful for Postman testing) */
  /*
  isStringGeoPoint(obj) {
    const array = obj || this.obj

    if (_.has(array, 'coordinates') && this.isDoubleStringArray(array.coordinates)) {
      return true
    } else {
      return false
    }
  }
  */

  /** validate if obj is geoFeature with coordinates as double string array (useful for Postman testing) */
  /*
  isStringGeoFeature(obj) {
    const array = obj || this.obj

    if (_.has(array, 'geometry.coordinates') && this.isDoubleStringArray(array.geometry.coordinates)) {
      return true
    } else {
      return false
    }
  }
  */


  /**
   * test to see if a key value pair is present in a [potentially] nested object
   * @param  {object}  obj [nested object]
   * @param  {object}  key [nested object representing the unique key]
   * @param  {value}   val [any value to test for]
   * @example
   * // here is the nested object to do the find on
      {
        "level1": {
          "level2": {
            "level2a": "nesting",
            "level2b": "nesting again",
            "level3": {
              "level4": {
                "level5": "value"
              }
            }
          }
        }
      }

      // you can pass this and it will return "value"
      {
        "level4": {
          "level5": "value"
        }
      }

      // you can pass this and it will return null
      {
        "level4": {
          "level5": "not the right value"
        }
      }

      // you can pass this and it will return null
      {
        "level4": {
          "notRightKey": "value"
        }
      }
   * @return {Boolean}     [whether the key-value pair exists]
   */
  hasKeyValuePair(findObj) {
    
    // flatten nested object and key
    const flatObj = flatten(this.obj)
    const flatFindObj = flatten(findObj)

    // create array of keys
    const objKeys = Object.keys(flatObj)
    const findObjKeys = Object.keys(flatFindObj)

    // find where key is in nested obj
    const keyTree = _.find(objKeys, nestedKey => {
      // return the nestedKey string that includes key
      return (_s.include(nestedKey, findObjKeys))
    })

    // return if no keyTree found
    if (!keyTree || is.empty(keyTree)) return false

    // find the value of the key
    const keyVal = _.get(this.obj, keyTree)
    const findVal = _.get(findObj, findObjKeys[0])

    // return true if values are equal
    return (keyVal === findVal)
  }
}


/**
 * retrieve values
 * @param  {object} object [object to retrieve values from]
 * @function .valueinArray: find the value of a key in an object
 * @function .valueAtKey: returns value at key if the key exists
 */
export class Retrieve {

  constructor(obj) {
    this.obj = obj
  }

  /**
   * find the value of a key in an object within an array
   * @param  {string} key [key of object to search for]
   * @param  {value}  val [value in key to search for]
   * @return {object}     [object that has a matching value in key of array]
   * 
   * @example
    let obj = {
      "long_name": "48",
      "short_name": "48",
      "types": [
        "street_number"
      ]
    }
    
    retrieve.objWithValueInArrayAtKey(obj, 'types', 'street_number') // returns obj
   */
  objIfValueIsWithinArrayAtKey(obj, key, val) {
    obj = obj || this.obj

    // return obj if obj.key has val in it
    if (_.includes(obj[key], val)) {
      return obj
    }
  } // valueInArray


  /**
   * find the value of a key in an object within an array
   * @param  {string} key [key of object to search for]
   * @param  {value}  val [value in key to search for]
   * @return {object}     [object that has a matching value in key of array]
   * 
   * @example
    let array = [
      {
        "long_name": "48",
        "short_name": "48",
        "types": [
          "street_number"
        ]
      },
      {
        "long_name": "Los Angeles",
        "short_name": "LA",
        "types": [
          "city"
        ]
      }
    ]

    
    retrieve.objWithValueInArrayAtKeyInArray(array, 'types', 'street_number') // returns [array[0]]
   */
  objectsWithValueInArrayAtKeyInArray(array, key, val) {
    array = array || this.obj
    if (is.not.array(array)) return

    let matchingObjects = []
    let matchingObject

    // find the obj if value is within array at key for each obj in passed array
    for (const obj of array) {
      matchingObject = this.objIfValueIsWithinArrayAtKey(obj, key, val)

      // push to matchingObjects array if found
      if (matchingObject) {
        matchingObjects.push(matchingObject)
      }
    }

    return matchingObjects
  }


  /**
   * returns value at key if the key exists
   * @param  {string} key [string representation of nested keys]
   * @return {value}      [value at key]
   */
  // TODO: deprecate this and only use _.get
  valueAtKey(key) {
    if (!_.has(this.object, key)) {
      return 
    } else {
      return _.get(this.object, key)
    } // if
  } // ofValue
} // class


/**
 * utility function to convert array or object to geoJsonPoint
 * @function .fromGeoJson: geoJson => geoJsonPoint
 * @function .fromLngLatArray: [lng, lat] => geoJsonPoint
 * @function .fromLatLngArray: [lat, lng] => geoJsonPoint
 * @function .fromLatLngObject: {lat, lng} => geoJsonPoint
 */
export class Convert {

  constructor(obj) {
    this.obj = obj
  }


  /** convert elements in array to camelCase */
  arrayElementsToCamelCase(obj) {

    obj = obj || this.obj

    let array = []

    for (const element of obj) {
      if (is.not.string(element)) continue
      array.push(changeCase.camelCase(element))
    } 

    return array
  }


  /** convert obj keys to 'objKey' */
  objectKeysToCamelCase(obj) {

    obj = obj || this.obj
    return humps.camelizeKeys(obj)
  }


  /** camelize values in object */
  objectValsToCamelCase(obj) {

    obj = obj || this.obj

    for (const key in obj) {
      if (is.not.string(obj[key])) continue

      obj[key] = changeCase.camelCase(obj[key])
    }

    return obj
  }


  /** snake_case values in object */
  objectValsToSnakeCase(obj) {

    obj = obj || this.obj

    for (const key in obj) {
      if (is.not.string(obj[key])) continue

      obj[key] = changeCase.snakeCase(obj[key])
    }

    return obj
  }


  /** convert array with [lng,lat] as strings to [lng,lat] as numbers (useful for Postman testing) */
  fromStringCoordArrayToNumberCoordArray(obj) {

    const array = obj || this.obj
    const validate = new Validate(array)

    if (validate.isDoubleNumberArray()) return array

    if (validate.isDoubleStringArray()) {
      return [Number(array[0]), Number(array[1])]
    } else {
      return new Error(array + ' is not a double string array')
    }
  }

  /** convert geojson with [lng,lat] as strings to [lng,lat] as numbers (useful for Postman testing) */
  /*
  fromStringGeoJsonToGeoFeature(obj, props) {
    let geoObj = obj || this.obj
    const validate = new Validate()

    if (geoJsonValidation.valid(obj)) return geoObj

    sails.log({geoObj})

    // convert coordinate string array to number array
    if (validate.isStringGeoPoint(geoObj)) {
      geoObj.coordinates = this.fromStringCoordArrayToNumberCoordArray(geoObj.coordinates)
    } else if (validate.isStringGeoFeature(geoObj)) {
      geoObj.geometry.coordinates = this.fromStringCoordArrayToNumberCoordArray(geoObj.geometry.coordinates)
      props = geoObj.properties
    } else {
      return new Error(geoObj + 'does not have coordinates')
    }

    return turf.point(coordinates, props)
  }
  */

  /** convert [lng, lat] to geojson point */
  fromLngLatArrayToGeoPoint(obj) {
    obj = obj || this.obj

    return {
      type: 'Point',
      coordinates: obj
    }
  }

  /** convert [lat, lng] to geojson point */
  fromLatLngArrayToGeoPoint(obj) {
    return this.fromLngLatArrayToGeoPoint(obj.reverse() || this.obj.reverse())
  }

  /** convert {lat: lat, lng: lng} to geojson point */
  fromLatLngObjectToGeoPoint(obj) {
    obj = obj || this.obj

    // if no {lat,lng} return error
    if (!_.has(obj, 'lat') || !_.has(obj, 'lat')) {
      return new Error('{lat, lng} object not passed')
    }

    return this.fromLngLatArrayToGeoPoint([obj.lng, obj.lat])
  }

  /** reverse geoJson coordinates from [lng, lat] to [lat, lng] */
  fromGeoJsonToLatLngArray(obj) {

    const geoJsonObj = obj || this.obj

    if (geoJsonValidation.isPoint(geoJsonObj)) {
      return geoJsonObj.coordinates.reverse()

    // return error if no array
    } else {
      sails.log.error('no coordinates in geoJsonObj:', geoJsonObj)
      return new Error('no coordinates in geoJsonObj')
    } // if
  } // fromGeoJsonToLatLngArray
} // exports.convert


export class Generate {

  constructor(obj) {
    this.obj = obj
  }

  randomIntBetween(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }


  remappedValuesInArray(mapping, array) {

    array = array || this.obj

    let val
    let remappedArray = []

    // get value
    for (const element of array) {
      // get val at key
      val = _.get(mapping, element)

      // move on to next element if no remapped value found
      if (!val) return

      // push remapped value to array
      remappedArray.push(val)
    }

    return remappedArray
  }

  
  /**
   * remap keys in object
   * @param  {object} mapping originalKey to newKey mapping
   * @param  {object} obj     object to remap
   * @return {object}         remapped object
   */
  remappedObjectKeys(mapping, obj) {

    obj = obj || this.obj

    let mappedObj

    // remap keys
    mappedObj = _.mapKeys(obj, (value, fromKey) => {
      return mapping[fromKey]
    })

    // remove missing keys from mapped object
    mappedObj = _.omit(mappedObj, 'undefined')
    return mappedObj
  }


  /**
   * remap keys in object
   * @param  {object}    mapping       - {originalKey:newKey} mapping
   * @param  {object[]}  originalArray - array of objects to remap
   * @return {object[]}                  remapped array of objects
   */
  remappedObjectKeysInArrayOfObjects(mapping, originalArray) {

    let remappedArray = []
    let mappedObj = {}

    // remap each element in array
    for (const fromObj of originalArray) {
      mappedObj = this.remappedObjectKeys(mapping, fromObj)

      // push to obj
      if (is.not.empty(mappedObj)) {
        remappedArray.push(mappedObj)
      } // if
    } // for

    return remappedArray
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
   * @param  {object} obj - object with keys to find permutations of
   * @param  {string} key - string of object to find permutations
   * @return {[]}         - array of permutations of the type of obj[key]
   */
  permutationsOfObjectByValuesInKey(obj, key) {
    let perms = [] // permutations to return
    let perm       // each permutation
    const variations = _.get(obj, key)

    if (is.not.array(variations)) return new Error('key is not an array')

    // clone obj for permutation then set the value at key
    for (const val of variations) {
      // clone permutation so obj is not mutated
      perm = _.cloneDeep(obj)
      // set value at key of permutation
      _.set(perm, key, val)
      perms.push(perm)
    }

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
    let permOfPerms = []

    // ensure keys are in array
    if (is.not.array(keys)) {
      if (is.string(keys)) keys = [keys]
      else return new Error('keys needs to be in an array')
    }

    // create array of objects with one key value pair
    for (const key of keys) {
      // get cartesian product of key value pairs
      perm = this.permutationsOfObjectByValuesInKey(_.pick(obj, key), key)
      if (is.error(perm)) return perm

      perms.push(perm)
    }

    // produce array of permutations of objects containing one key value pair
    const cartesianProducts = this.cartesianProduct(perms)

    // merge key value pairs into clone of original obj
    let objClone
    for (const cartesianProduct of cartesianProducts) {
      // clone obj to create new permutation object
      objClone = _.cloneDeep(obj)

      // merge permutation field into clone for each keyValue pair
      for (const keyValuePair of cartesianProduct) {
        _.merge(objClone, keyValuePair)
      }

      permOfPerms.push(objClone)
    }

    sails.log.info('found permutations:', permOfPerms)
    return permOfPerms
  }
} // Generate


export class Download {

  /**
   * @param  {string}   dest - destination to save file
   * @param  {[string]} urls - urls of files to download
   */
  constructor(dest, urls) {

    this.dest = dest
    this.urls = is.array(urls) ? urls : [urls]
    this.download = new Downloader()

    // set up downloader for each url
    for (const url of this.urls) {
      this.download = this.download.get(url)
    }
  }


  /**
   * run downloader on files
   * @return {promise} - files that finished downloading
   */
  process() {

    const thiz = this

    return new Promise(function(resolve, reject) {
      return thiz.download
        .dest(thiz.dest)
        .run((err, files) => {
          if (err) return reject(err)
          return resolve(files)
        })
    })
  }
}
