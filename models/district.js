var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  city_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'City'
  },
  name: {
    type: String,
    require: true
  }
})

module.exports = mongoose.model('district',schema)