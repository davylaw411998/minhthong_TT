const express = require('express')
const router = express.Router();

var Pitch = require('../../models/pitch')

//api danh cho khach hang

//liet ke danh sach san
router.get('/list', function (req, res, next) {
  const resPerPage = parseInt(req.query.page_size)
  const page = req.query.page
  var query
  var city = req.query.city
  var district = req.query.district
  if (district) {
    query = { $and: [{ name: new RegExp(req.query.search) }, { district: district }, { city: city }] }
  } else query = { $and: [{ name: new RegExp(req.query.search) }, { city: city }] }

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
//hien thi thong tin 1 san

router.get('/list/:id', function (req, res, next) {
  let promise = Pitch.findOne({ _id: req.params.id }).exec()

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(201).json({ msg: err })
  })
})

module.exports = router