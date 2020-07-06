const express = require('express')
const router = express.Router();

const Pitch = require('../../models/pitch')
const BookPitch = require('../../models/bookPitch')
const subPitch = require('../../models/subpitch')
// truy cap chi tiet san
router.get('/list/:id', function (req, res, next) {
  console.log(req.params.id)
  let promise = Pitch.find({ _id: req.params.id }).exec()

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ msg: err })
  })
})