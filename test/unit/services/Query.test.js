/**
* Query.test.js
*
* @description :: unit test for query service
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

import _ from 'lodash'
import Promise from 'bluebird'

// helpers
import {Clean, Describe} from '../../helpers/clean'
import {MongooseCrud} from '../../helpers/crud'
import faker from 'faker'
import {Fake} from '../../helpers/fake'
const ObjectId = require('mongodb').ObjectID

const _describe = new Describe('place')

// custom logger
import {Log} from '../../../api/services/Log'
let fn
let log
let logLevels = {
  '.convertStringsArrayToObjectIds': 'warn'
}


describe('Query Service', () => {
// describe.only('Query Service', () => {

  let find
  let result
  let place
  let user1
  let user2
  let location1
  let location2

  before(done => {
    fn = '#Find'; log = new Log(fn, logLevels[fn])

    // Place.mongoose.findAsync()
    //   .then(result => {
    //     location1 = result[0].location
    //     location2 = result[1].location
    //   })
    //   .then(() => User.mongoose.findAsync())
    return User.mongoose.findAsync()
      .then(result => {
        user1 = result[0]
        user2 = result[1]

        // add to history
        user1.history = []
        user1.history.push({ place: { location: location1 } })
        user2.history = []
        user2.history.push({ place: { location: location2 } })

        return Promise.all([
          user1.saveAsync(),
          user2.saveAsync()
        ])
      })
      .then(() => done())
      .catch(done)
  })

  describe('#Find', () => {

    describe('.constructor', () => {
    // describe.only('.constructor', () => {
      it('should return error if no model is passed', () => {
        find = new Query.Find()
        find.should.be.an.error
      })

      it('should return error if select is not a string or array', () => {
        find = new Query.Find(User, null, {a:1})
        find.should.be.an.error
      })

      it('should get a string select from array in format ["field", "field", "field"]', () => {
        find = new Query.Find(User, null, ['field', 'field', 'field'])
        find.select.should.be.instanceOf(String)
        find.select.should.equal('field field field')
      })
    })

    describe('.constructQuery', () => {

      let filters

      it('should apply filters to a query', () => {
        filters = [{ username: user1.username}]
        find = new Query.Find(User, filters)
        result = find.constructQuery()
        result.should.be.instanceOf(Object)
        result.should.have.property('username')
      })

      it('should return error if filters is not an array', () => {
        filters = { username: user1.username }
        find = new Query.Find(User, filters)
        result = find.constructQuery()
        result.should.be.an.error
      })

      it('should return error if filters array does not contain objects', () => {
        filters = [{ username: user1.username}, 'username']
        find = new Query.Find(User, filters)
        result = find.constructQuery()
        result.should.be.an.error
      })
    })


    describe('.addFilterByArray', () => {
    // describe.only('.addFilterByArray', () => {

      let filters
      let result
      let userIds = []
      let find

      before(done => {
        fn = '.manyByIds'; log = new Log(fn, logLevels[fn])

        User.mongoose.findAsync()
          .each(result => {
            userIds.push(result._id)
          })
          .then(results => {
            filters = [{ username: results[0].username }]
            done()
          })
          .catch(done)
      })

      it('should apply filters to a query', () => {
        filters = [{ '_id': userIds }]
        // filters = [{ 'notifications.channels': ['test1'] }]
        find = new Query.Find(User)
        result = find.addFilterByArray(filters)

        result.should.be.instanceOf(Array)
        result = result[0]
        result.should.be.instanceOf(Object)
        result.should.have.property('_id')
        result['_id'].should.have.property('$in')
        result['_id']['$in'].should.equal(filters[0]['_id'])
      })

      it('should return error if array is not passed', () => {
        filters = { '_id': userIds }
        find = new Query.Find(User, filters)
        
        result = find.addFilterByArray(filters)
        result.should.be.an.error
      })

      it('should just extend query with filter if filter value is not an array', () => {
        filters = [{ '_id': 1234 }]
        find = new Query.Find(User, filters)
        result = find.addFilterByArray(filters)

        result.should.be.instanceOf(Array)
        result = result[0]
        result.should.have.property('_id')
        result['_id'].should.equal(1234)
      })
    })


    describe('.convertStringToObjectId', () => {
      it('should convert strings in array to object ids', () => {
        find = new Query.Find(User)
        result = find.convertStringToObjectId(user1._id.toString())
        ObjectId.isValid(result).should.be.true
      })
    })


    describe('.convertStringsArrayToObjectIds', () => {

      it('should convert strings in array to object ids', () => {
        fn = '.convertStringsArrayToObjectIds'; log = new Log(fn, logLevels[fn])

        const array = [user1._id.toString(), user2._id.toString()]
        find = new Query.Find(User)
        result = find.convertStringsArrayToObjectIds(array)
        result.should.be.instanceOf(Array)
        result.should.have.length(2)
        ObjectId.isValid(result[0]).should.be.true
        ObjectId.isValid(result[1]).should.be.true
      })

      it('should return array of object ids if array is already object ids', () => {
        const array = [user1._id, user2._id]
        find = new Query.Find(User)
        result = find.convertStringsArrayToObjectIds(array)
        result.should.be.instanceOf(Array)
        result.should.have.length(2)
        result[0].should.equal(user1._id)
        result[1].should.equal(user2._id)
      })
    })


    /*
    describe('.near', () => {
    // describe.only('.near', () => {

      let location
      let radius
      let limit
      let result
      let types
      let find

      before(done => {
        Place.mongoose.findAsync()
          .spread(result => {
            location = result.location
            done()
          })
          .catch(done)
      })

      it('should find one place if radius is very focused', done => {
        radius = 10

        find = new Query.Find(Place)
        find.near('location', location, radius)
          .then(result => {
            result.should.be.instanceOf(Array)
            result.should.have.length(1)
            done()
          })
          .error(done)
          .catch(done)
      })

      it('should find places if no radius was passed', done => {
        find = new Query.Find(Place)
        find.near('location', location)
          .then(result => {
            result.should.be.instanceOf(Array)
            result.should.have.length(4)
            done()
          })
          .error(done)
          .catch(done)
      })

      it('should only return fields that are in select if select is an array of format ["field", "field"]', done => {
        find = new Query.Find(Place, null, ['createdAt', 'name'])
        find.near('location', location)
          .then(result => {
            result.should.be.instanceOf(Array)
            result.should.have.length(4)

            for (let _result of result) {
              _result = _result.toObject()
              _result.should.not.have.property('location')
              _result.should.have.property('name')
              _result.should.have.property('createdAt')
            }

            done()
          })
          .catch(done)
      })

      it('should only return fields that are in select if select is in format "field field field"', done => {
        find = new Query.Find(Place, null, 'createdAt name')
        find.near('location', location)
          .then(result => {
            result.should.be.instanceOf(Array)
            result.should.have.length(4)

            for (let _result of result) {
              _result = _result.toObject()
              _result.should.not.have.property('location')
              _result.should.have.property('name')
              _result.should.have.property('createdAt')
            }

            done()
          })
          .catch(done)
      })
    })
    */


    describe('.many', () => {
    // describe.only('.many', () => {
      let result
      let userIds = []
      let filters
      let find

      before(done => {
        fn = '.many'; log = new Log(fn, logLevels[fn])

        User.mongoose.findAsync()
          .each(result => {
            userIds.push(result._id)
          })
          .then(() => done())
          .catch(done)
      })

      it('should find many users by status', done => {
        filters = [{ status: 'active' }]
        find = new Query.Find(User, filters)

        find.many()
          .then(results => {
            results.should.be.instanceOf(Array)
            results.should.have.length(2)
            done()
          })
          .catch(done)
      }) // it
    }) // describe


    describe('.removeMany', () => {
    // describe.only('.removeMany', () => {

      let startingCount
      let result
      let userIds = []
      let filters
      let find

      before(done => {
        fn = '.removeMany'; log = new Log(fn, logLevels[fn])

        User.mongoose.findAsync()
          .then(results => {
            startingCount = results.length

            // create one record to remove
            return User.mongoose.createAsync({ isFake: true })
              .then(result => {
                userIds.push(result._id)
                done()
              })
          })
          .catch(done)
      })

      it('should removeMany by filter', done => {
        filters = [{ isFake: true }]
        find = new Query.Find(User, filters)

        find.removeMany()
          .then(results => {
            results.should.be.instanceOf(Object)
            results.result.ok.should.equal(1)

            return User.mongoose.findAsync()
              .then(result => {
                result.length.should.equal(startingCount)
                done()
              })
          })
          .catch(done)
      }) // it
    })


    describe('.byId', () => {
    // describe.only('.byId', () => {

      let result
      let userId
      let find
      let select

      before(done => {
        User.mongoose.findAsync()
          .spread(result => {
            userId = result._id
            done()
          })
          .catch(done)
      })

      it('should find user by id', done => {
        find = new Query.Find(User)

        find.byId(userId)
          .then(result => {
            result.should.be.instanceOf(Object)
            result.should.have.property('_id')
            done()
          })
          .catch(done)
      })

      it('should find select only certain fields', done => {
        select = 'username score'
        find = new Query.Find(User, null, select)

        find.byId(userId)
          .then(result => {
            result = result.toObject()
            result.should.be.instanceOf(Object)
            result.should.have.property('_id')
            result.should.have.property('username')
            result.should.have.property('score')
            result.should.not.have.property('auth')
            done()
          })
          .catch(done)
      })
    })


    describe('.manyByIds', () => {
    // describe.only('.manyByIds', () => {

      let result
      let userIds = []
      let filters
      let find

      before(done => {
        fn = '.manyByIds'; log = new Log(fn, logLevels[fn])

        User.mongoose.findAsync()
          .each(result => {
            userIds.push(result._id)
          })
          .then(results => {
            filters = [{ username: results[0].username }]
            done()
          })
          .catch(done)
      })

      it('should find many users by ids', done => {
        find = new Query.Find(User)

        find.manyByIds('_id', userIds)
          .then(results => {
            results.should.be.instanceOf(Array)
            results.should.have.length(3)
            done()
          })
          .catch(done)
      })

      it('should filter results', done => {
        find = new Query.Find(User, filters)

        find.manyByIds('_id', userIds)
          .then(results => {
            results.should.be.instanceOf(Array)
            results.should.have.length(1)
            done()
          })
          .catch(done)
      })
    })
  })
})
