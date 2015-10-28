/**
 * test bootstrap succeeded
 */

import _ from 'lodash'
import is from 'is_js'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
const ObjectId = require('mongodb').ObjectID
import {Clean} from '../helpers/clean'

// color consoles
import chalk from 'chalk'
const success = chalk.bgGreen.black
const failure = chalk.bgRed.black
const trace = chalk.bgBlue.black


let result


describe('Unit Tests', () => {

  describe('#bootstrap', () => {

    it('sails lifted', () => {
      sails.should.exist;
      sails.should.equal(global.sails)
    });

    it('app available', () => {
      app.should.exist
      app.should.equal(global.app)
    });

    it('global models available', () => {
      User.should.exist
    })
  })


  describe('#fixtures', () => {

    it('should have records in global fixtures', () => {
      fixtures.user.should.be.instanceOf(Array)
    })

    it('should have references in global fixtures', () => {
      for (const _auth of fixtures.auth) {
        _auth.should.have.property('_user')
      }
    })

    it('should have __label when unit testing', () => {
      for (const _user of fixtures.user) {
        _user.should.have.property('__label')
      }
    })

    it('should have discriminators when unit testing', () => {
      fixtures.should.have.property('userFacebook')
      fixtures.should.have.property('userTwitter')
      fixtures.userFacebook.should.be.instanceOf(Array)
      fixtures.userTwitter.should.be.instanceOf(Array)
      fixtures.userFacebook.should.not.be.empty
      fixtures.userTwitter.should.not.be.empty
    })

    it('should be able to get fixture by global function', () => {
      result = fixtures.getVal(fixtures.User, '__label', 'user1', '_id')
      result.should.exist
    })

    it('should be able to get value by global function', () => {
      result = fixtures.getFixture(fixtures.User, '__label', 'user1')
      result.should.be.instanceOf(Object)
      result.should.have.property('_id')
    })
  })


  describe('#http', () => {

    it('should load homepage', done => {
      request(app)
        .get('/')
        .expect(200, done)
    })
  })

  describe('#helpers', () => {

    describe('#Clean', () => {

      let clean
      let mongooseCrud
      let recordsToTeardown

      before(() => {
        clean = new Clean(User)
      })

      it('should count records in db', done => {
        clean.countRecords()
          .then(records => {
            records.should.be.eql(fixtures['user'].length);
            done()
          })
          .catch(done)
      })

      it('should save records to preserve', done => {
        clean.preserveRecords()
          .then(records => {
            records.length.should.be.eql(fixtures['user'].length);
            done()
          })
          .catch(done)
      })
    })
  })

  describe('#polyfills', () => {
    it('should have asyncawait', done => {
      function sleep(ms = 0) {
        return new Promise(r => setTimeout(r, ms));
      }

      (async () => {
        console.log('a');
        await sleep(1000);
        console.log('b');
        done()
      })()
    })
  })

  describe.only('#deepPopulate', () => {
    it('can populate deep nested references', async done => {
      try {
        result = await Post.mongoose.findById(fixtures.post[0]._id.toString())
          .deepPopulate('_comments._user')
          .execAsync()

        result.should.have.property('_comments')
        result._comments.should.be.instanceOf(Array)
        result._comments[0].should.have.property('_id')
        result._comments[0].should.have.property('_user')
        result._comments[0]._user.should.have.property('_id')
        done()
      } catch(err) {
        done(err)
      }
    })
  })

})
