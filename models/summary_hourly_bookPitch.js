var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  total:{
    type: Number,
    require: true
  },
  revenue: {
    type: Number,
    require: true
  },
  users:[mongoose.Schema.Types.ObjectId],
  day: Number,
  month: Number,
  year: Number,
  hour: Number,
  fullDate:Number,
  subpitch_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Subpitch'
  }
})

module.exports = mongoose.model('summary_hourly_bookPitch',schema)