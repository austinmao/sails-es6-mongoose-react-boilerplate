import mongoose from 'mongoose'
import glob from 'glob'
import path from 'path'
 
// // connect mongoose to mongodb
// mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017');
 
// console.log('Trying to connect to MongoDB via Mongoose ...');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'Mongoose connection error:'));
// db.once('open', function callback() {
//   console.log('Connected Mongoose to MongoDB!');

//   // get all model in /api/models
// });

let models = {};
_iterateModels();
 
 
/**
 * iterate api/schemas and create mongoose models
 */
function _iterateModels() {

  console.log('iterate model');
  glob("api/schemas/*.js", {}, function(err, files) {
    console.log(files);

    for (var i = files.length - 1; i >= 0; i--) {
      const basename = path.basename(files[i], '.js');
      console.log(process.cwd()+ '/' + files[i]);

      const tmp_schema = require(process.cwd()+ '/' + files[i]);
      models[basename] = _createMongooseModel(tmp_schema, basename);
    };
  });
};

 
/**
 * create mongoose models from a schema object
 * @param  {[type]} schema_description [description]
 * @param  {[type]} model_name         [description]
 * @return {[type]}                    [description]
 */
function _createMongooseModel(schema_description, model_name) {

  let schema = new mongoose.Schema(schema_description.attributes);

  if (schema_description.methods) {
    schema.methods = schema_description.methods;
  }

  if (schema_description.statics) {
    schema.statics = schema_description.statics;
  }

  if (schema_description.beforeSave) {
    schema.pre('save', function (next){
      schema_description.beforeSave(this, next);
    });
  }

  return mongoose.model(model_name, schema)
};

 
// Expose Mixed type and ObjectId type for Models
models.Mixed = mongoose.Schema.Types.Mixed;
models.ObjectId = mongoose.Schema.Types.ObjectId;

// Expose all models loaded
module.exports = models;