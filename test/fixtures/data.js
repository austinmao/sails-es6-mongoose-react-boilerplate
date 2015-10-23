var ObjectID = require('mongodb').ObjectID

// set var to reference _id from other schemas
var user = exports.user = [
  {
    __label: 'user1',
    __discriminator: 'Facebook',
    _id: ObjectID(),
    firstName: "Hello",
    lastName: "World",
    email: "hello@world.com"
  },
  {
    __label: 'user2',
    __discriminator: 'Twitter',
    _id: ObjectID(),
    firstName: "Foo",
    lastName: "Bar",
    email: "foo@bar.com"
  }
]

var auth = exports.auth = [
  {
    email: "hello@world.com",
    _user: user[0]._id // setting user as parent
  },
  {
    email: "foo@bar.com",
    _user: user[1]._id
  }
]