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
var glob = Promise.promisify(require('glob'))
var path = require('path')
var _s = require('underscore.string')
var changeCase = require('change-case')

// add babel to global var
global.babel = require("sails-hook-babel/node_modules/babel/register")();


/** loads the sails server and fixtures */
before(function (done) {

  clear() // clear terminal

  // // Increase the Mocha timeout so that Sails has enough time to lift.
  // this.timeout(12000)

  // Lift Sails with test database
  Sails.lift({}, function(err, server) {

    if (err) {
      console.error('failed to lift sails')
      return done(err)
    };

    sails = server;
    sails.localAppURL = localAppURL = ( sails.usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';

    // add to global vars for use in testing
    global.sails = sails
    global.app = sails.express ? sails.express.app : sails.hooks.http.app;

    /************************
    *** populate fixtures ***
    ************************/
    global.fixtures = {}
    // load fixture data
    var fixtures = require('./fixtures/data.js')
    // set models to map
    var models   = _.keys(require('./fixtures/data.js'))

    // get each model
    return Promise.map(models, function(model) {
      // get each record
      return Promise.map(fixtures[model], function(fixture) {
        // create a record for each model
        return sails.models[model.toLowerCase()].mongoose.createAsync(fixture)
      })
    })

      // find and to global.fixtures
      .then(function() {
        return Promise.map(models, function(model) {
          // find records for each created model
          return sails.models[model.toLowerCase()].mongoose.findAsync()
            .tap(function(records) {
              global.fixtures[model] = records
            })
        })
      })
      // .tap(() => sails.log(global.fixtures))
      
      .then(function(result) {
        clear() // clear terminal again
        done(null, sails)
      })
      .catch(err => {
        sails.log.error(err)
        done(err)
      })
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
