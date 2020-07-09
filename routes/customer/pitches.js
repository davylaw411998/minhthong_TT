const express = require('express')
const router = express.Router();
const _ = require('lodash')
const Pitch = require('../../models/pitch')
const BookPitch = require('../../models/bookPitch')
const subPitch = require('../../models/subpitch')
const User = require('../../models/user')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

/* api danh cho khach hang */

//tim tat ca san // batbuoc phai co city
router.get('/list', function (req, res, next) {
  const resPerPage = parseInt(req.query.page_size)
  const page = parseInt(req.query.page)
  var query = null
  console.log(req.query.name)
  if(req.query.name !== "" && req.query.name !== undefined){
    const name = new RegExp(req.query.name, "i")
    query = { $and: [{ name: name}, { district: req.query.district }]}
  }else query = {district: req.query.district}

  let promise = Pitch.find(query).exec()
  promise.then(function (doc) {
    const pages = Math.ceil(doc.length / resPerPage)
    Pitch.find(query).sort({ name: 1 })
      .skip((resPerPage * page) - resPerPage)
      .limit(resPerPage)
      .then(doc => {
        const numOfPitchs = doc.length;
        const foundPitchs = [];
        if(doc && doc.length){
          for (let i = 0; i < doc.length; i++) {
            foundPitchs.push(doc[i])
          }
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

router.get('/list/:id', function (req, res, next) {

  Pitch.aggregate([
    {
      $match: {
        _id:req.params.id
      }
    }
    ,
    {
      $unwind:{
        "path": "$subpitch",
        "preserveNullAndEmptyArrays": true
      }
    }
    ,
    {
      $lookup:
      {
          from: "subpitches",
          localField: "subpitch",
          foreignField: "_id",
          as: "subpitchDetail"
      }
    },
    {
      $lookup:
      {
          from: "districts",
          localField: "district",
          foreignField: "_id",
          as: "district"
      }
    },
    {
      $unwind:"$district"
    },
    {
      $lookup:
      {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city"
      }
    },
    {
      $unwind:"$city"
    },
    {
      $project: {
        _id: "$_id",
        name:"$name",
        subpitchDetail:"$subpitchDetail",
        address:"$address",
        city:"$city",
        district:"$district",
        phone_number:"$phone_number",
        createdAt:"$createdAt"
      }
    },
    {
      $group:{
        _id : {
          _id:"$_id",
          name:"$name",
          address:"$address",
          city:"$city",
          district:"$district",
          phone_number:"$phone_number",
          createdAt:"$createdAt"
        },
        subpitch:{$addToSet:"$subpitchDetail"},
      }
    }
  ]).then(doc => {
    var listpitch = []
    for(let i = 0 ; i < doc.length; i++){
      listpitch.push({_id:doc[i]._id._id, address:doc[i]._id.address, name:doc[i]._id.name,city:doc[i]._id.city,
      district:doc[i]._id.district,phone_number:doc[i]._id.phone_number,createdAt:doc[i]._id.createdAt,subpitchDetail:doc[i].subpitch})
    }
    res.status(200).json(listpitch)
  })
})

// dat san
router.post('/bookPitch', function (req, res, next) {
  let promise
  console.log(req.body)
  if (!req.body.subpitch_id || !req.body.user_id || !req.body.time || !req.body.price) {
    return res.status(400).json({msg: "INVALID INFO"})
  } else {
    const bookpitch = new BookPitch({
      subpitch_id: req.body.subpitch_id,
      user_id: req.body.user_id,
      time: req.body.time,
      price: req.body.price,
      createdAt: Date.now()
    })

    BookPitch.findOne({subpitch_id : req.body.subpitch_id, time :req.body.time}).then(doc=>{
      if(doc){
        return res.status(400).json({msg: 'Subpitck is exists'})
      }else {
        promise = bookpitch.save()
        promise.then(function (doc) {
          return res.status(201).json({msg: 'SUCCESS'})
        })
      
        promise.catch(function (err) {
          return res.status(501).json({ msg: "ERROR" })
        })
      }
    })
  }
})

// xem lich su dat san
router.get('/history/:id', async function (req, res, next) {
  const userId = req.params.id
  if (!userId) {
    return res.status(400).json({msg: "INVALID INFO"})
  } else {
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
  }
})

//check san da dat hay chua
router.get('/check', function (req, res, next) {
  let promise = bookpitch.find({ _id: req.query.id, time:req.query.time }).exec()

  promise.then(function (doc) {
    return res.status(200).json(doc)
  })

  promise.catch(function (err) {
    return res.status(400).json({ msg: err })
  })
})

//tim san trong
router.get('/find', async function (req, res, next) {
  const resPerPage = parseInt(req.query.page_size)
  const page = parseInt(req.query.page)
  var query
  const name = new RegExp(req.query.name, "i")
  const city = req.query.city
  const district = req.query.district
  const time = parseInt(req.query.time)
  const date = parseInt(req.query.date)
  let _freeSubpitch = []
  if (!city || !time || !date || !resPerPage || !page) {
    return res.status(400).json({msg: "INVALID INFO"})
  } else {
    if (district) {
      query = { $and: [{ name: name}, { district: district }]}
    } else {
      query = { $and: [{ name: name}, { city: city }] }
    }
    let result = await Pitch.find(query)
    if (result && result.length) {
      let timeSelect = date + time * 3600000
      let _subpitch = await subPitch.find({}, {pitch_id: 1, name: 1, time: 1})
      _subpitch = _.reject(_subpitch, (el) => {
        return !el.time[time].enable
      })
      _.forEach(_subpitch, (el) => {
        el.price = el.time[time].price
      })
      let _subpitchBooked = await BookPitch.find({time: timeSelect}, {_id: 0, subpitch_id: 1})
      let queryIdFreePitch = []
      if (_subpitch && _subpitch.length) {
        if (_subpitchBooked && _subpitchBooked.length) {
          _freeSubpitch = _.reject(_subpitch, (el) => {
            let count = 0
            _.forEach(_subpitchBooked, (booked) => {
              if (String(booked.subpitch_id) === String(el._id)) {
                count ++
              }
            })
            if (count > 0) {
              return true
            }
          })
        } else {
          _freeSubpitch = _subpitch
        }
      }
      result = _.reject(result, (el) => {
        let count = 0
        _.forEach(_freeSubpitch, (free) => {
          if (String(free.pitch_id) === String(el._id)) {
            count ++
          }
        })
        if (count === 0) {
          return true
        }
      })
      _.forEach(result, (el) => {
        queryIdFreePitch.push(el._id)
      })
      const pages = Math.ceil(result.length / resPerPage)
      Pitch.find({_id: {$in: queryIdFreePitch}}).sort({ name: 1 })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .then(doc => {
          const numOfPitchs = doc.length;
          const foundPitchs = [];
          _.forEach(doc, (el) => {
            let temp = []
            _.forEach(_freeSubpitch, (fsp) => {
              if (String(el._id) === String(fsp.pitch_id)) {
                temp.push({subpitchId: fsp._id, name: fsp.name, price: fsp.price})
              }
            })
            foundPitchs.push({
              name: el.name,
              address: el.address,
              city: el.city,
              district: el.district,
              phone: el.phone_number,
              image: el.image,
              type: el.pitch_type,
              subpitchList: temp
            })
          })
          res.status(200).json({
            data: foundPitchs,
            currentPage: page,
            totalPage: pages,
            totalResults: numOfPitchs
          })
        })
    } else {
      res.status(200).json(result)
    }
  }
})
module.exports = router