var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var schema = new Schema({
  name: {
    type: String,
    require: true
  },
  address: {
    type: String,
    require: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    require: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    require: true
  },
  phone_number: {
    type: String,
    require: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User'
  },
  image: {
    type: String
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    required: true
  },
  desc : {
      type: String,
  },
  subpitch:[mongoose.Schema.Types.ObjectId]
})

module.exports = mongoose.model('Pitch',schema)