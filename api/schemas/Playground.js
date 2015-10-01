module.exports = {

  attributes: {
    name: String,
    login: String,
    password: String,
  },

  methods: {
    // Here i defined my instances method for the model
    instanceMethod: function(params) {
      return params
    },
  },

  statics: {
    // Here are the statics methods for the model 
    staticMethod: function(params) {
      sails.log('in staticMethod with params:', params)
      return params
    },
  },
}