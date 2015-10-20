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
      // User.should.exist
    })
  })


  /*
  describe('#databases', () => {

    let user
    let place

    it('should load user fixtures with waterline', done => {
      User.find().exec(function(err, results) {
        results.length.should.be.eql(fixtures['user'].length);
        results[0].should.have.property('username')
        done();
      });
    })

    it('should load user fixtures with mongoose', done => {
      User.mongoose.findAsync()
        .then(results => {
          results.length.should.be.eql(fixtures['user'].length);
          results[0].should.have.property('username')
          done()
        })
        .catch(done)
    })
  });
  */


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
})
