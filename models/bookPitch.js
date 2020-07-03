var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var schema = new Schema({
	subpitch_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Subpitch'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'User'
  },
  time: {
    type: Number,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    require: true
  }
})

module.exports = mongoose.model('bookPitch',schema)