# Sails 0.11 with ES6/7, Mongoose, Blueprints, React+Redux, Immutable, and More

The NodeJS server is built on a customized [sailsjs](http://sailsjs.org/) framework: [sails-mongoose-boilerplate(https://github.com/austinmao/sails-mongoose-boilerplate). This supports the following features:

## From Sails...

* Opinionated MVC framework. See [Controllers](http://sailsjs.org/documentation/concepts/controllers) and [Models](http://sailsjs.org/documentation/concepts/models-and-orm)
* RESTful JSON API via [blueprints](http://sailsjs.org/documentation/reference/blueprint-api)
* [WebSocket support](http://sailsjs.org/documentation/reference/web-sockets/socket-client)
* ...and more that you can read about [here](http://sailsjs.org/documentation/concepts/file-uploads)

## Custom added...

* Replaced the [Waterline](https://github.com/balderdashy/waterline) ORM with [Mongoose](http://mongoosejs.com/). Note that Mongoose works with Blueprints!
* ES6/7 with [Babel](https://babeljs.io/), including [await-async](https://www.twilio.com/blog/2015/10/asyncawait-the-hero-javascript-deserved.html)
* Unit testing with [Mocha Unit Testing Framework](https://mochajs.org) and [Should.js Assertion Library](https://shouldjs.github.io/)
* [React](https://facebook.github.io/react/) and [Redux](http://rackt.org/redux/index.html) support (although I recommend using [react-redux-universal boilerplate](https://github.com/erikras/react-redux-universal-hot-example))
* [Immutable.js](https://facebook.github.io/immutable-js/) support
* [Bluebird](http://bluebirdjs.com/) promise library

## Todo

- [ ] Add file upload demo
- [ ] Connect Mongoose to Blueprint sockets
- [ ] Add ESLint
- [ ] Upgrade [sails-hook-babel](https://github.com/artificialio/sails-hook-babel) to ES6 and strip out custom Babel implementation