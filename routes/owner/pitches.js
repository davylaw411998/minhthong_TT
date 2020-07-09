const express = require('express')
const router = express.Router();

const Pitch = require('../../models/pitch')
const BookPitch = require('../../models/bookPitch')
const subPitch = require('../../models/subpitch')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const _ = require('lodash')

// truy cap chi tiet san
router.get('/list/:id', function (req, res, next) {
  let promise = Pitch.findOne({ _id: req.params.id }).exec()

  promise.then(function (doc) {
    console.log(doc)
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
    phone_number: req.body.phone_number,
    image: req.body.image,
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
  Pitch.aggregate([
    {
      $match: {
        owner_id:ObjectId(req.query.user_id )
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
    //console.log(doc)
    var listpitch = []
    for(let i = 0 ; i < doc.length; i++){
      listpitch.push({_id:doc[i]._id._id, address:doc[i]._id.address, name:doc[i]._id.name,city:doc[i]._id.city,
      district:doc[i]._id.district,phone_number:doc[i]._id.phone_number,createdAt:doc[i]._id.createdAt,subpitchDetail:doc[i].subpitch})
    }
    res.status(200).json(listpitch)
  }).catch(function (err) {
    return res.status(400).json({ msg: "error", details: err });
  })
})
//update san
router.put('/update/:id', function (req, res, next) {
  let promise = Pitch.updateOne({ _id: req.params.id }, req.body).exec()
  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ msg: "Update pitch false" })
  })
})

router.get('/history/:id', async function (req, res, next) {
  console.log(req.query)
  const userId = req.params.id
  if (!userId) {
    return res.status(400).json({msg: "INVALID INFO"})
  } else {
    const arr = [];
    var query = {owner_id: userId}

    if(req.query.pitch_id !== "undefined"){
      console.log(1)
      query = {_id : ObjectId(req.query.pitch_id), owner_id: userId}
    }   
    Pitch.find(query).then(data => {
      _.forEach(data, e => {
        console.log(e.subpitch)
        arr.push(e.subpitch)
      })
      
      const arrySubpitch = Array.prototype.concat(...arr)
      // arrySubpitch = _.forEach(arrySubpitch, e => {
      //   return ObjectId(arrySubpitch)
      // })
      console.log(arrySubpitch)
      var queryBook = [{subpitch_id: {$in : arrySubpitch}}]
      if(req.query.daystart !== "undefined"){
        queryBook.push({time:{$gte:+new Date(req.query.daystart)}})
      }
      if(req.query.dayend !== "undefined"){
        queryBook.push({time:{$lt:+new Date(req.query.dayend)}})
      }
      console.log(queryBook)
      BookPitch.aggregate([
        {
          $match: {
            $and : queryBook
          }
        }
        ,
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
        }
        ,
        {
          $lookup:
          {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user"
          }
        },
        {
          $unwind:"$user"
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
            bookedAt: "$createdAt",
            username : "$user.username",
            firstname : "$user.firstname",
            lastname : "$user.lastname",
            phone : "$user.phone",
            price:"$price"
          }
        }
      ]).then(doc => {
        //console.log(doc)
        return res.status(200).json(doc)
      }).catch(function (err) {
        return res.status(400).json({ msg: "error", details: err });
      })
    })
  }
})

module.exports = router;