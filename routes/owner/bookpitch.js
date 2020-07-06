const express = require('express')
const router = express.Router();

var Pitch = require('../../models/pitch')

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