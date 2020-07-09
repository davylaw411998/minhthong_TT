const express = require('express')
const router = express.Router();

var Subpitch = require('../../models/subpitch')
var Pitch = require('../../models/pitch')

router.post('/create', function (req, res, next) {
  subpitch = new Subpitch({
    name: req.body.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    subpitch_type: req.body.subpitch_type,
    pitch_id: req.body.pitch_id,
    active: req.body.active,
    time: req.body.time
  })

  let promise = subpitch.save();

  promise.then(function (doc) {
    Pitch.updateOne({_id:req.body.pitch_id},{$push:{subpitch:doc._id}}).exec()
    res.status(200).json(doc)
  })

  promise.catch(function (err) {
    res.status(400).json(err)
  })
})

router.get('/list/:id', function (req, res, next) {
  let promise = Subpitch.findOne({_id:req.params.id}).exec()

  promise.then(function (doc) {
    res.status(200).json(doc)
  })

  promise.catch(function (err) {
    res.status(400).json(err)
  })
})

router.put('/update/:id', function(req, res, next){
  console.log(req.body)
  console.log(req.params.id)
  let promise = Subpitch.updateOne({_id:req.params.id},req.body).exec()

  promise.then(function (doc) {
    res.status(200).json(doc)
  })

  promise.catch(function (err) {
    res.status(400).json(err)
  })
})

router.delete('/delete/:id',function(req, res, next){
  Subpitch.findOne({_id : req.params.id}).then(doc => {
    let pitch_id = doc.pitch_id
    Subpitch.deleteOne({_id:req.params.id}).then(rs => {
      Pitch.updateOne({_id:pitch_id},{$pull:{subpitch:req.params.id}}).exec()
    }).catch(function (err) {
      res.status(400).json(err)
    })
  }).catch(function (err) {
    res.status(400).json(err)
  })
})

module.exports = router