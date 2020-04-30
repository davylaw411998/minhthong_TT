const express = require('express')
const router = express.Router();

var Pitch = require('../../models/pitch')

// truy cap chi tiet san
router.get('/list/:id', function (req, res, next) {
  let promise = Pitch.find({ _id: req.params._id }).exec()

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ msg: err })
  })
})

// tao san
router.post('/create', function (req, res, next) {
  var pitch = new Pitch({
    name: req.body.name,
    desc: req.body.desc,
    address: req.body.address,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    district: req.body.district,
    city: req.body.city,
    phone_number: req.body.phone_number,
    pitch_type: req.body.pitch_type,
    image_url: req.body.image_url,
    owner_id: req.session.user_id
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

  query = { $and: [{ name: new RegExp(req.query.search) }, { owner_id: req.session.user_id }] }

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
          foundPitchs.push({
            name: doc[i].name, phone: doc[i].phone, address: doc[i].address,
            city: doc[i].city, district: doc[i].district
          })
        }
        res.status(200).json({
          infoPitchs: foundPitchs,
          currentPage: page,
          pages: pages,
          numOfResults: numOfPitchs
        })
      })

    promise.catch(function (err) {
      return res.status(500).json({ msg: err })
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


module.exports = router;