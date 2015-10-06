/**
* Utils.test.js
*
* @description :: unit test for Utils
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

import _ from 'lodash'
import is from 'is_js'
import Promise from 'bluebird'
import moment from 'moment'
import request from 'supertest-as-promised'
import geoJsonValidation from 'geojson-validation'
import fse from 'fs-extra'
Promise.promisifyAll(fse)
import faker from 'faker'
import $url from 'url'
import path from 'path'
import util from 'util'
import {Fake} from '../../helpers/fake'
import {Validate, Retrieve, Convert, Generate} from '../../../api/services/Utils'
const fake = new Fake()

// color consoles
import chalk from 'chalk'
const success = chalk.bgGreen.black
const failure = chalk.bgRed.black


describe('Utils Service', () => {

  // set up geoPoint
  const point = {
    "type": "Point",
    "coordinates": [-105.01621,39.57422]
  }

  // set up geoPoint with string coords
  let clone = _.cloneDeep(point)
  clone.coordinates = ['0','0']
  const stringPoint = clone

  // set up coords array and string coords array
  const coords = [0, 1]
  const stringCoords = ['0', '1']


  describe('#Validate', () => {

    let validate = new Validate()

    describe('.hasKeys', () => {

      let obj = {}
      let result

      it('should return true if keys exist', () => {
        obj = {
          a: 1,
          b: 2
        }

        result = validate.hasKeys(['a','b'], obj)
        result.should.not.be.an.error
      })

      it('should return false if keys do not exist', () => {
        obj = {
          a: 1,
          b: 2
        }

        result = validate.hasKeys(['a','b', 'c'], obj)
        result.should.not.be.error
      })

      it('should return true if keys exist', () => {
        obj = {
          a: 1,
          b: 2
        }

        result = validate.hasKeys(['a','b'], obj)
        result.should.not.be.an.error
      })

      it('should return false if keys do not exist', () => {
        obj = {
          a: 1,
          b: 2
        }

        result = validate.hasKeys(['a','b', 'c'], obj)
        result.should.not.be.error
      })

      it('should return true if keys are null and object exists', () => {
        obj = {
          a: 1,
          b: 2
        }

        result = validate.hasKeys(null, obj)
        result.should.not.be.an.error
      })

      it('should return false if keys are null and object does not exist', () => {
        obj = {}

        result = validate.hasKeys(null, obj)
        result.should.be.an.error
      })

      it('should return true if nested keys exist', () => {
        obj = {
          a: 1,
          b: {
            x: 2,
            y: 3
          }
        }

        result = validate.hasKeys(['b.x', 'b.y'], obj)
        result.should.not.be.an.error
      })

      it('should return error if nested keys do not exist', () => {
        obj = {
          a: 1,
          b: {
            x: 2,
            y: 3
          }
        }

        result = validate.hasKeys(['b.z', 'b.y'], obj)
        result.should.be.an.error
      })
    }) // describe

    
    describe('.isDoubleStringArray', () => {
      it('should validate a two string array', () => {
        validate.isDoubleStringArray(stringCoords).should.equal(true)
      })

      it('should not validate a two number array', () => {
        validate.isDoubleStringArray(coords).should.equal(false)
      })

      it('should not validate a three item array', () => {
        let obj = [123, 456, 'hello']
        validate.isDoubleStringArray(obj).should.equal(false)
      })
    }) // describe
    

    describe('.isDoubleNumberArray', () => {
      it('should validate a two number array', () => {
        validate.isDoubleNumberArray(coords).should.equal(true)
      })

      it('should not validate a two string array', () => {
        validate.isDoubleNumberArray(stringCoords).should.equal(false)
      })

      it('should not validate a three item array', () => {
        let obj = [123, 456, 'hello']
        validate.isDoubleNumberArray(obj).should.equal(false)
      })
    }) // describe

    /*
    describe('.isStringGeoPoint', () => {
      it('should validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(true)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(point).should.equal(false)
      })

      it('should not validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(false)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(feature).should.equal(false)
      })
    }) // describe

    describe('.isStringGeoPoint', () => {
      it('should validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(true)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(feature).should.equal(false)
      })

      it('should not validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(false)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(point).should.equal(false)
      })
    }) // describe

    describe('.isStringGeoJson', () => {
      it('should validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(true)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(point).should.equal(false)
      })

      it('should not validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(false)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(feature).should.equal(false)
      })

      it('should validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(true)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(feature).should.equal(false)
      })

      it('should not validate a geoPoint with string coords', () => {
        validate.isStringGeoPoint(stringPoint).should.equal(false)
      })

      it('should not validate a geoPoint', () => {
        validate.isStringGeoPoint(point).should.equal(false)
      })
    })

    describe('.isGeoJson', () => {
      let validate = new Validate()

      it('should validate a geoJson feature with a number array', () => {
        validate.isGeoJson(feature).should.equal(true)
      })

      it('should validate a geoJson feature with a string array', () => {
        validate.isGeoJson(stringPoint).should.equal(true)
      })

      it('should validate a geoJson point with a number array', () => {
        validate.isGeoJson(point).should.equal(true)
      })

      it('should validate a geoJson point with a string array', () => {
        validate.isGeoJson(stringPoint).should.equal(true)
      })

      it('should not validate a coordinate array', () => {
        validate.isGeoJson(coords).should.equal(false)
      }) // it
    }) // describe
    */

    describe('.hasKeyValuePair', () => {
      const obj = {
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
      } // obj

      let validate = new Validate(obj)

      it('finds matching value at key', () => {
        // test good check
        let findObj = {
          "level4": {
            "level5": "value"
          }
        }

        validate.hasKeyValuePair(findObj).should.equal(true)
      }) // it

      it('does not find non-matching value at key', () => {
        // test bad check
        let findObj = {
          "level4": {
            "level5": "not the right value"
          }
        }

        validate.hasKeyValuePair(findObj).should.equal(false)
      }) // it

      it('does not find non-matching key', () => {
        // test bad check
        let findObj = {
          "level4": {
            "notRightKey": "value"
          }
        }

        validate.hasKeyValuePair(findObj).should.equal(false)
      }) // it
    }) // describe
  }) // describe


  describe('#Retrieve', () => {

    let streetNumber = {
      "long_name": "48",
      "short_name": "48",
      "types": [
        "street_number"
      ]
    }

    let street = {
      "long_name": "Pirrama Road",
      "short_name": "Pirrama Rd",
      "types": [
        "route"
      ]
    }

    let city = {
      "long_name": "Los Angeles",
      "short_name": "LA",
      "types": [
        "city"
      ]
    }

    let array = [streetNumber, street, city]
    let retrieve = new Retrieve()
    let result

    describe('.objIfValueIsWithinArrayAtKey', () => {
      it('should return object with matching values', () => {
        result = retrieve.objIfValueIsWithinArrayAtKey(streetNumber, 'types', 'street_number')
        result.should.equal(streetNumber)
      })

      it('should not return any objects with non-matching values', () => {
        let streetNumberClone = _.clone(streetNumber)
        streetNumberClone.types = []
        result = retrieve.objIfValueIsWithinArrayAtKey(streetNumberClone, 'types', 'street_number')
        // FIXME: should is not working on undefined
        // (streetNumber != result).should.be.true
      })
    })

    describe('.objectsWithValueInArrayAtKeyInArray', () => {
      it('should return object with matching values', () => {
        result = retrieve.objectsWithValueInArrayAtKeyInArray(array, 'types', 'street_number')
        result.should.be.instanceOf(Array)
        _.isEqual(result, [streetNumber]).should.be.true
      }) // it

      it('should not return objects with non-matching values', () => {
        result = retrieve.objectsWithValueInArrayAtKeyInArray(array, 'types', 'blah')
        result.should.be.instanceOf(Array)
        result.should.be.empty
      })
    }) // describe
  }) // describe


  describe('#Convert', () => {

    let obj
    let result
    let convert = new Convert()
    let route

    describe('.arrayElementsToCamelCase', () => {
      it('should convert array elements to camelCase', () => {
        obj = [ 'helloWorld', 'ni_hao_guo', 'HolaMundo' ]
        result = convert.arrayElementsToCamelCase(obj)
        result.should.be.instanceOf(Array)
        result.should.have.containEql('helloWorld')
        result.should.have.containEql('niHaoGuo')
        result.should.have.containEql('holaMundo')
      })
    })

    describe('.objectKeysToCamelCase', () => {
      it('should convert object keys to camelCase', () => {
        obj = { 'helloWorld': 1, 'ni_hao_guo': 2, 'HolaMundo': 3 }
        result = convert.objectKeysToCamelCase(obj)
        result.should.be.instanceOf(Object)
        result.should.have.property('helloWorld')
        result.should.have.property('niHaoGuo')
        result.should.have.property('holaMundo')
      })
    })

    describe('.objectValsToCamelCase', () => {
      it('should convert object vals to camelCase', () => {
        obj = { 'helloWorld': 'helloWorld0', 'ni_hao_guo': 'ni_hao_guo', 'HolaMundo': 'holaMundo2', 'night_club': 'nightClub' }
        result = convert.objectValsToCamelCase(obj)
        result.should.be.instanceOf(Object)
        result.helloWorld.should.equal('helloWorld0')
        result.ni_hao_guo.should.equal('niHaoGuo')
        result.HolaMundo.should.equal('holaMundo2')
        result.night_club.should.equal('nightClub')
      })
    })

    describe('.objectValsToSnakeCase', () => {
      it('should convert object vals to snake_case', () => {
        obj = { 'helloWorld': 'helloWorld0', 'ni_hao_guo': 'ni_hao_guo', 'HolaMundo': 'holaMundo2', 'night_club': 'nightClub' }
        result = convert.objectValsToSnakeCase(obj)
        result.should.be.instanceOf(Object)
        result.helloWorld.should.equal('hello_world_0')
        result.ni_hao_guo.should.equal('ni_hao_guo')
        result.HolaMundo.should.equal('hola_mundo_2')
        result.night_club.should.equal('night_club')
      })
    })

    describe('.fromStringCoordArrayToNumberCoordArray', () => {
      it('should convert double string array to double number array', () => {
        result = convert.fromStringCoordArrayToNumberCoordArray(stringCoords)
        result.should.be.instanceOf(Array)
        result[0].should.be.instanceOf(Number)
        result[1].should.be.instanceOf(Number)
      })

      it('should return double number array if doulbe number array was passed', () => {
        result = convert.fromStringCoordArrayToNumberCoordArray(coords)
        result.should.be.instanceOf(Array)
        result[0].should.be.instanceOf(Number)
        result[1].should.be.instanceOf(Number)
      })

      it('should not convert arrays with more than two elements', () => {
        obj = ['0','1','2']
        result = convert.fromStringCoordArrayToNumberCoordArray(obj)
        result.should.be.an.error
      })
    })

    /*
    route = 'fromGeoJsonToLatLngArray'
    describe('.' + route, () => {
      it('should convert geoJson point with double string coord array to geoJson point with double number coord array', () => {
        result = convert[route](stringPoint)
        geoJsonValidation.isPoint(result).should.be.true
      })

      it('should convert geoJson point with double number coord array to geoJson point with double number coord array', () => {
        result = convert[route](point)
        geoJsonValidation.isPoint(result).should.be.true
      })

      it('should return geoJson point if geoJson point was passed', () => {
        result = convert[route](point)
        geoJsonValidation.isPoint(result).should.be.true
      })

      it('should return geoJson point if geoJson point was passed', () => {
        result = convert[route](point)
        geoJsonValidation.isPoint(result).should.be.true
      })
    })
    */

    describe('.fromLngLatArrayToGeoPoint', () => {
      it('should convert [lng,lat] to geoPoint', () => {
        result = convert.fromLngLatArrayToGeoPoint(coords)
        geoJsonValidation.isPoint(result).should.be.true
        result.coordinates[0].should.equal(coords[0])
      })
    })

    describe('.fromLatLngArrayToGeoPoint', () => {
      it('should convert [lng,lat] to geoPoint', () => {
        result = convert.fromLatLngArrayToGeoPoint(coords.reverse())
        geoJsonValidation.isPoint(result).should.be.true
        // result.coordinates[1].should.equal(coords[0])
      })
    })

    route = 'fromLatLngObjectToGeoPoint'
    describe('.' + route, () => {
      it('should convert [lng,lat] to geoPoint', () => {
        obj = {
          lat: 39.57422,
          lng: -105.01621
        }

        result = convert[route](obj)
        geoJsonValidation.isPoint(result).should.be.true
        _.isEqual(result.coordinates, [obj.lng, obj.lat]).should.equal(true)
      })
    })

    /*
    route = 'fromStringGeoJsonToGeoPoint'
    describe('.' + route, () => {
      it('should convert to geoPoint', () => {
        obj = {
          lat: 0,
          lng: 1
        }

        result = convert[route](obj)
        geoJsonValidation.isPoint(result).should.be.true
        result.geometry.coordinates[0].should.equal(obj.lng)
        result.geometry.coordinates[1].should.equal(obj.lat)
      })
    })
    */
  }) // describe


  describe('#Generate', () => {

    let obj
    let generate = new Generate()
    let result
    let mapping

    describe('.randomIntBetween', () => {
      it('should generate a random integer between min and max', () => {
        generate.randomIntBetween(1, 10).should.be.above(0).and.below(11)
      })
    })

    describe('.remappedValuesInArray', () => {
      it('should remap values in array', () => {
        const array = ['a', 'b', 'c']
        mapping =  { a: 'x', b: 'y', c: 'z' }

        result = generate.remappedValuesInArray(mapping, array)
        result.should.be.instanceOf(Array)
        result.should.have.length(3)
        result[0].should.equal('x')
        result[1].should.equal('y')
        result[2].should.equal('z')
      })
    })

    describe('.remappedObjectKeys', () => {
      const mapFromObj = { a: 1, b: 2, c: 3 }
      mapping =  { a: 'x', b: 'y', c: 'z' }

      it('should remap objects in an object', () => {

        result = generate.remappedObjectKeys(mapping, mapFromObj)
        result.should.be.instanceOf(Object)
        result.x.should.equal(1)
        result.y.should.equal(2)
        result.z.should.equal(3)
      })

      it('should not have missing keys from mapping in remapped object', () => {
        mapping = { a: 'x' }

        result = generate.remappedObjectKeys(mapping, mapFromObj)
        result.should.be.instanceOf(Object)
        result.should.have.key('x')
        result.should.not.have.key('y', 'z')
      })
    })

    describe('.remappedObjectKeysInArrayOfObjects', () => {
      it('should remap objects in an array', () => {
        const mapFromArray = [
          {
            a: 1,
            b: 2,
            c: 3
          },
          {
            a: 4,
            b: 5,
            c: 6
          }
        ]

        const mapping = {
          a: 'x',
          b: 'y',
          c: 'z'
        }

        result = generate.remappedObjectKeysInArrayOfObjects(mapping, mapFromArray)

        result.should.be.instanceOf(Array)
        result.should.have.length(2)
        result[0].x.should.equal(1)
        result[0].y.should.equal(2)
        result[0].z.should.equal(3)
        result[1].x.should.equal(4)
        result[1].y.should.equal(5)
        result[1].z.should.equal(6)
      })
    })

    describe('.cartesianProduct', () => {
      it('should generate 2 permutations for 2 variations', () => {
        obj = [
          [1,2],
          ['a','b']
        ]

        generate = new Generate()
        result = generate.cartesianProduct(obj)
        result.should.be.instanceOf(Array)
        result.should.have.length(4)
      }) // it
    })

    describe('.permutationsOfObjectByValuesInKey', () => {
      it('should return error if key is not an array', () => {
        obj = {
          a: [1, 2],
          b: 'c'
        }

        generate = new Generate()
        result = generate.permutationsOfObjectByValuesInKey(obj, 'b')
        result.should.be.an.error
      })

      it('should generate 2 permutations for 2 variations', () => {
        obj = {
          a: [1, 2],
          b: 'c'
        }

        generate = new Generate()
        result = generate.permutationsOfObjectByValuesInKey(obj, 'a')
        result.should.be.instanceOf(Array)
        result.should.have.length(2)
      })
    })

    describe.only('.permutationsOfObjectByKeyValueVariations', () => {
      it('should produce array of objects with permutations', () => {
        obj = {
          a: [1, 2],
          b: ['z', 'x']
        }

        generate = new Generate()
        result = generate.permutationsOfObjectByKeyValueVariations(obj, ['a', 'b'])
        result.should.be.instanceOf(Array)
        result.should.have.length(4)

        for (const res of result) {
          res.should.have.property('a')
          res.should.have.property('b')
          res.a.should.be.instanceOf(Number)
          res.b.should.be.instanceOf(String)
        }
      })

      it('should produce array of objects with permutations with only the specified key value pairs combined', () => {
        obj = {
          a: [1, 2],
          b: ['z', 'x'],
          c: 'hello'
        }

        generate = new Generate()
        result = generate.permutationsOfObjectByKeyValueVariations(obj, ['a', 'b'])
        result.should.be.instanceOf(Array)
        result.should.have.length(4)

        for (const res of result) {
          res.should.have.property('a')
          res.should.have.property('b')
          res.a.should.be.instanceOf(Number)
          res.b.should.be.instanceOf(String)
        }
      })
    })
  })  

  describe('#Download', () => {

    let url
    let dest
    let download

    describe('.constructor', () => {

      it('should add downloads to the downloader request', () => {
        const url1 = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png'
        const url2 = 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/400px-Flag_of_France.svg.png'
        dest = process.env.PWD + '/.tmp/public/'

        const urls = [url1, url2]

        download = new Utils.Download(dest, urls)
        download.download.should.have.property('_get')
      })
    })

    describe('.process', () => {
    // describe.only('.process', () => {

      let parsedUrl
      let fileName

      it('should download one file', done => {
        url = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png'
        dest = process.env.PWD + '/.tmp/public/'

        download = new Utils.Download(dest, url)
        return download.process()
          .then(result => {
            parsedUrl = $url.parse(url)
            fileName = path.basename(parsedUrl.pathname)

            return fse.statAsync(dest + fileName)
              // .tap(sails.log)
              .then(result => {
                result.should.have.property('ctime')
                done()
              })
          })
          .catch(done)
      })

      it('should download multiple files', done => {
        const url1 = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/800px-Flag_of_the_United_States.svg.png'
        const url2 = 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/400px-Flag_of_France.svg.png'

        const urls = [url1, url2]
        dest = process.env.PWD + '/.tmp/public/'

        download = new Utils.Download(dest, urls)
        return download.process()
          .then(result => {

            return Promise.map(urls, function(url) {
              parsedUrl = $url.parse(url)
              fileName = path.basename(parsedUrl.pathname)

              return fse.statAsync(dest + fileName)
            })
              // .tap(sails.log)
              .each(file => {
                file.should.have.property('ctime')
              })
              .then(result => done())
          })
          .catch(done)
      })


    })
  })
}) // describe
