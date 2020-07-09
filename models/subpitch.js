var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var schema = new Schema({
  name: {
    type: String,
    require: true
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    require: true
  },
  updatedAt: {
    type: Number,
    default: Date.now(),
    required: true
  },
  subpitch_type: {
    type: Number,
    require: true
  }, // 1: san 5, 2: san 7, 3: ca 2 loai
  pitch_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Pitch'
  },
  active:{
    type: Boolean,
    default: true,
    require: true
  },// true : active, false : inactive
  time:{
    type: Schema.Types.Mixed,
    default: {
      1: {
        price: 0,
        enable: false
      },
      2: {
        price: 0,
        enable: false
      },
      3: {
        price: 0,
        enable: false
      },
      4: {
        price: 0,
        enable: false
      },
      5: {
        price: 0,
        enable: false
      },
      6: {
        price: 0,
        enable: false
      },
      7: {
        price: 0,
        enable: false
      },
      8: {
        price: 0,
        enable: false
      },
      9: {
        price: 0,
        enable: false
      },
      10: {
        price: 0,
        enable: false
      },
      11: {
        price: 0,
        enable: false
      },
      12: {
        price: 0,
        enable: false
      },
      13: {
        price: 0,
        enable: false
      },
      14: {
        price: 0,
        enable: false
      },
      15: {
        price: 0,
        enable: false
      },
      16: {
        price: 0,
        enable: false
      },
      17: {
        price: 0,
        enable: false
      },
      18: {
        price: 0,
        enable: false
      },
      19: {
        price: 0,
        enable: false
      },
      20: {
        price: 0,
        enable: false
      },
      21: {
        price: 0,
        enable: false
      },
      22: {
        price: 0,
        enable: false
      },
      23: {
        price: 0,
        enable: false
      },
      24: {
        price: 0,
        enable: false
      },
    }
  }
})

module.exports = mongoose.model('Subpitch',schema)