var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bcrypt = require('bcryptjs');

var schema = new Schema({
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now(),
    required: true
  },
  updatedAt: {
    type: Number,
    required: true
  },
  firstname: {
    type: String,
    require: true
  },
  lastname: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  permission : {
    type: String,   // 0:owner, 1:customer
    require :true
  }
});

schema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

schema.methods.isValid = function (hashedPassword) {
  return bcrypt.compareSync(hashedPassword, this.password)
}

module.exports = mongoose.model('User', schema)