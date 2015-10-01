/**
* bootstrap.test.js
*
* @description :: global before and after hooks for unit tests to raise/lower sails server
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

var Sails = require('sails')
var Barrels = require('barrels')
var clear = require('cli-clear')
var Promise = require('bluebird')
var sails
// var barrels
// var fixtures // fake json data

// add babel to global var
global.babel = require("sails-hook-babel/node_modules/babel/register")();


/** loads the sails server and fixtures */
before(function (done) {

  clear() // clear terminal

  // // Increase the Mocha timeout so that Sails has enough time to lift.
  // this.timeout(12000)

  // Lift Sails with test database
  Sails.lift({
    // log: { level: 'silent' },
    // log: { level: 'info' }
    // log: { level: 'warn' },
    // models: {
    //   connection: 'mongo',
    //   // connection: 'test',
    //   migrate: 'drop'
    // }
  }, function(err, server) {

    if (err) {
      console.error('failed to lift sails')
      return done(err)
    };

    sails = server;
    sails.localAppURL = localAppURL = ( sails.usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';

    // add to global vars for use in testing
    global.sails = sails
    global.app = sails.express ? sails.express.app : sails.hooks.http.app;

    // populate fixtures
    global.fixtures = {}

    var fixtures = [
      {
        model: Place,
        name: 'place',
        data: require('./fixtures/place.json')
      },
      {
        model: User,
        name: 'user',
        data: require('./fixtures/user.json')
      }
    ]

    // populate each fixture
    Promise.map(fixtures, function(fixture) {
      _Populate(fixture.model, fixture.data)
        .then(function(result) {
          global.fixtures[fixture.name] = result
        })
    })
      .then(function(result) {
        clear() // clear terminal again
        done(null, sails)
      })
      .catch(done)


    /**
     * populate model with fixtures
     * @param  {object}   model    - model to populate
     * @param  {object[]} fixtures - data to populate
     * @return {promise}             fulfilled promise with success or error
     */
    function _Populate(model, fixtures) {

      // populate each fixture to the db through mongoose create
      return Promise.map(fixtures, function(fixture) {
        return model.mongoose.createAsync(fixture)
          .catch(sails.log.error)
      })
        .catch(sails.log.error)
    }

    /*
    // instantiate fixtures creator
    barrels = new Barrels()

    // save original objects in `fixtures` variable
    global.fixtures = barrels.data

    // populate fixtures
    barrels.populate(function(err) {
      sails.log.verbose('successfully lifted sails')
      done(err, sails);
    })
    
    done(err, sails);
    */
  });
});


/** stops the sails server */
after(function (done) {

  sails.log.verbose('lowering sails')

  sails.lower(function(err) {
    if (err) throw new Error(err)
    sails.log.verbose('successfully lowered sails')
    done()
  });
});
