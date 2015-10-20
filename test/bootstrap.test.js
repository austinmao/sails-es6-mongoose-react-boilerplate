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
    var fixtures = []

    // get fixture files
    return glob('./test/fixtures/*.json')

      // populate each model with fixtures
      .then(function(files) {

        _.each(files, function(file) {

          // get name to find model
          var basename = path.basename(file, '.json');

          // remove 'test/' from file
          file = _s.splice(file, 2, 5)

          fixtures.push({
            basename: basename,
            model: changeCase.lowerCase(basename),
            path: require(file) // get file contents
          })
        })

        // get each model
        return Promise.map(fixtures, function(fixture) {
          // get each record
          return Promise.map(fixture.path, function(record) {
            // create a record for each model
            return sails.models[fixture.model].mongoose.createAsync(record)
          })
        })
      })

      // find all records and set them to global.fixtures
      .then(function() {
        return Promise.map(fixtures, function(fixture) {
          return sails.models[fixture.model].mongoose.findAsync()
            .then(function(records) {
              global.fixtures[fixture.basename] = records
            })
        })
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
