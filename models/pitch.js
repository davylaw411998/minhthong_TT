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
  pitch_type: {
    type: Number,
    require: true
  }, // 1: san 5, 2: san 7 , 3: ca 2,
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User'
  },
  image_url: {
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
  active:{
    type: Boolean,
    require: true,
    default: true
  },
  subpitch:[{type:mongoose.Schema.Types.ObjectId}]
})

module.exports = mongoose.model('Pitch',schema)