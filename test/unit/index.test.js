/**
 * test bootstrap succeeded
 */

import _ from 'lodash'
import is from 'is_js'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
const ObjectId = require('mongodb').ObjectID
import {Clean} from '../helpers/clean'

import {expect} from 'chai'
import {List, Map} from 'immutable';


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
      result = fixtures.getVal(fixtures.user, '__label', 'user1', '_id')
      result.should.exist
    })

    it('should be able to get value by global function', () => {
      result = fixtures.getFixture(fixtures.user, '__label', 'user1')
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
        await sleep(1000);
        done()
      })()
    })
  })

  describe('#deepPopulate', () => {
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

  describe('immutability', () => {

    describe('numbers', () => {

      function increment(currentState) {
        return currentState + 1;
      }

      it('are immutable', () => {
        let state = 42;
        let nextState = increment(state);

        expect(nextState).to.equal(43);
        expect(state).to.equal(42);
      });

    });

    describe('Lists', () => {

      function addMovie(currentState, movie) {
        return currentState.push(movie);
      }

      it('are immutable', () => {
        let state = List.of('Trainspotting', '28 Days Later');
        let nextState = addMovie(state, 'Sunshine');

        expect(nextState).to.equal(List.of(
          'Trainspotting',
          '28 Days Later',
          'Sunshine'
        ));
        expect(state).to.equal(List.of(
          'Trainspotting',
          '28 Days Later'
        ));
      });

    });

    describe('trees', () => {

      function addMovie(currentState, movie) {
        return currentState.update('movies', movies => movies.push(movie));
      }

      it('are immutable', () => {
        let state = Map({
          movies: List.of('Trainspotting', '28 Days Later')
        });
        let nextState = addMovie(state, 'Sunshine');

        expect(nextState).to.equal(Map({
          movies: List.of(
            'Trainspotting',
            '28 Days Later',
            'Sunshine'
          )
        }));
        expect(state).to.equal(Map({
          movies: List.of(
            'Trainspotting',
            '28 Days Later'
          )
        }));
      });

    });

  });


})
