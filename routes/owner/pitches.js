const express = require('express')
const router = express.Router();

const Pitch = require('../../models/pitch')
const BookPitch = require('../../models/bookPitch')
const subPitch = require('../../models/subpitch')

const _ = require('lodash')

// truy cap chi tiet san
router.get('/list/:id', function (req, res, next) {
  console.log(req.params.id)
  let promise = Pitch.findOne({ _id: req.params.id }).exec()

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ msg: err })
  })
})

// tao san
router.post('/create', function (req, res, next) {
  console.log(req.body.user_id)
  var pitch = new Pitch({
    name: req.body.name,
    desc: req.body.desc,
    address: req.body.address,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    district: req.body.district,
    city: req.body.city,
    phone_number: req.body.phone,
    image_url: req.body.image_url,
    owner_id: req.body.user_id,
    subpitch : []
  })

  let promise = pitch.save()

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ msg: "Error creating pitch" })
  })
})
//hien thi danh sach san cua chu san
router.get('/list', function (req, res, next) {
  const resPerPage = parseInt(req.query.page_size)
  const page = req.query.page
  var query

  query = { owner_id: req.query.user_id }

  let promise = Pitch.find(query).exec()

  promise.then(function (doc) {
    const pages = Math.ceil(doc.length / resPerPage)
    Pitch.find(query).sort({ name: 1 })
      .skip((resPerPage * page) - resPerPage)
      .limit(resPerPage)
      .then(doc => {
        const numOfPitchs = doc.length;
        const foundPitchs = [];
        for (let i = 0; i < doc.length; i++) {
          foundPitchs.push(doc[i])
        }
        res.status(200).json({
          infoPitchs: foundPitchs,
          currentPage: page,
          pages: pages,
          numOfResults: numOfPitchs
        })
      })

    promise.catch(function (err) {
      return res.status(400).json({ msg: err })
    })
  })
})
//update san
router.post('/update/:id', function (req, res, next) {
  let promise = Pitch.updateOne({ _id: req.params.id }, req.body).exec()
  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ msg: "Update pitch false" })
  })
})

router.get('/history/:id', async function (req, res, next) {
  const userId = req.params.id
  if (!userId) {
    return res.status(400).json({msg: "INVALID INFO"})
  } else {
    Pitch.find({owner_id: userId}).then(data => {
      BookPitch.aggregate([
        {
          $match: {
            user_id: ObjectId(userId)
          }
        },
        {
          $lookup:
          {
              from: "subpitches",
              localField: "subpitch_id",
              foreignField: "_id",
              as: "subpitchDetail"
          }
        },
        {
          $unwind:"$subpitchDetail"
        },
        {
          $lookup:
          {
              from: "pitches",
              localField: "subpitchDetail.pitch_id",
              foreignField: "_id",
              as: "pitchDetail"
          }
        },
        {
          $unwind:"$pitchDetail"
        },
        {
          $project:{
            name: "$pitchDetail.name",
            address:"$pitchDetail.address",
            district:"$pitchDetail.district",
            city:"$pitchDetail.city",
            phone_number: "$pitchDetail.phone_number",
            subpitch: "$subpitchDetail.name",
            time: "$time",
            bookedAt: "$createdAt"
          }
        }
      ]).then(doc => {
        return res.status(200).json(doc)
      }).catch(function (err) {
        return res.status(400).json({ msg: "error", details: err });
      })
    })
  }
})

module.exports = router;