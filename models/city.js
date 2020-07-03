var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var schema = new Schema({
  name: {
    type: String,
    require: true,
  }
})

module.exports = mongoose.model('city',schema)