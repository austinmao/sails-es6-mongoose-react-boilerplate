/**
* bootstrap.test.js
*
* @description :: global before and after hooks for unit tests to raise/lower sails server
* @docs        :: http://sailsjs-documentation.readthedocs.org/en/latest/concepts/Testing/
*/

var Sails = require('sails')
var clear = require('cli-clear')
var Promise = require('bluebird')
var glob = Promise.promisify(require('glob'))
var path = require('path')
var _s = require('underscore.string')
var _ = require('lodash')
var changeCase = require('change-case')
var is = require('is_js')
var chai = require('chai')
var chaiImmutable = require('chai-immutable')
var jsdom = require('jsdom')

var sails

/**
init babel with polyfill for regenerator
@see https://github.com/babel/babel/issues/303
*/
global.babel = require("babel-polyfill")

/** bind dom objects to global */
var doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
var win = doc.defaultView;

global.document = doc;
global.window = win;

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

// allow chai to test immutablejs objects
chai.use(chaiImmutable)


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

    var localAppURL

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
      return Promise.each(fixtures[model], function(fixture) {

        // create a record for each discriminator
        if (fixture.__discriminator) {
          return sails.models[model.toLowerCase()].mongoose[fixture.__discriminator].createAsync(fixture)

            // add fixture to global.FixtureDiscriminator
            .tap(function(record) {
              var discFixture = model + fixture.__discriminator
              if (is.not.array(global.fixtures[discFixture])) {
                global.fixtures[discFixture] = []
              }
              global.fixtures[discFixture].push(record)
            })
        }

        // create a record for each model
        return sails.models[model.toLowerCase()].mongoose.createAsync(fixture)
      })

        // add model to global fixtures
        .tap(function(records) {
          global.fixtures[model] = records
        })
    })

      // bind fixture finder to global
      .then(function(result) {
        // get prop at key with val
        var getVal = function(model, key, val, prop) {
          sails.log({model, key, val, prop})
          return _.find(model, _.matchesProperty(key, val))[prop]
        }

        // get fixture by key and value
        var getFixture = function(model, key, val) {
          sails.log({model, key, val})
          return _.find(model, _.matchesProperty(key, val))
        }

        global.fixtures.getVal     = getVal
        global.fixtures.getFixture = getFixture
      })

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
