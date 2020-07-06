var express = require('express');
var router = express.Router();
var _ = require('lodash');
const BookPitch = require('../../models/bookPitch');
const Pitch = require('../../models/pitch');
const SummaryBookPitchDay = require('../../models/summary_hourly_bookPitch');
var mongoose = require('mongoose')

//const Tickets = require('../../model/ticket')
const cronJob = require('cron').CronJob
//crontab ticket
const job = new cronJob('* * * * *', function (req, res) {
    console.log("crontab ticket")
    var hourStart = new Date().getHours() - 1 //lay tu 1 gio truoc gio hien tai
    var dateStart = new Date().getDate()
    var monthStart = new Date().getMonth() + 1
    var yearStart = new Date().getFullYear()
    var timestampsStart = +new Date(monthStart + "-" + dateStart + "-" + yearStart + " " + hourStart + ":00:00")
    var timestampsEnd = +new Date()
    
    BookPitch.aggregate([
    //   {
    //     $match: {
    //       createdAt: { $gte: timestampsStart, $lte: timestampsEnd }
    //     }
    //   },
      {
        $project: {
          subpitch_id: "$subpitch_id",
          date: { "$add": [new Date(0), "$time", 7 * 60 * 60 * 1000] },
          user:"$user_id",
          price:"$price"
        }
      },
      {
        $group: {
          _id: {
            subpitch_id: "$subpitch_id",
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" },
            hour: { $hour: "$date" }
          },
          users:{$addToSet:"$user"},
          total: {
            $sum: 1
          },
          revenue:{
            $sum:"$price"
          }
        }
      }
    ]).then(function (doc) {
      const calls = []
      if(doc && doc.length){
        for(let i = 0 ; i < doc.length; i++) {
          console.log(doc[i].users)
          var timestamps = +new Date(doc[i]._id.month + "-" + doc[i]._id.day + "-" + doc[i]._id.year + " " + doc[i]._id.hour + ":00:00")
          var query = {
            subpitch_id: doc[i]._id.subpitch_id,
            day: doc[i]._id.day,
            month: doc[i]._id.month,
            year: doc[i]._id.year,
            hour: doc[i]._id.hour,
            fullDate: Math.floor(timestamps / 1000 / 60 / 60)
          },
            update = { total: doc[i].total, users:doc[i].users,revenue:doc[i].revenue },
            options = { upsert: true, new: true };
    
          calls.push(SummaryBookPitchDay.findOneAndUpdate(query, update, options))
        };
      }
  
      const callSave = []
      //call 
      Promise.all(calls).then((results) => {
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            results[i] = new SummaryBookPitchDay();
          }
          callSave.push(results[i].save());
        }
        Promise.all(callSave).then((results) => {
          return console.log({ msg: 'ok' })
        }).catch((err) => {
          return console.log({ msg: err.toString() })
        })
      }).catch((err) => {
        return console.log({ msg: err.toString() })
      })
  
    })
});
job.start();
  // if (isAvailableStartCron) {
  //   job.start();
  // }
//total ticket trong 1 ngay
router.get('/total', function (req, res, next) {
  var total = 0
  var date
  var pitch_id = req.query.pitch_id
  console.log(pitch_id)
  if (req.query.date !== undefined) {
    date = new Date(req.query.date)
  } else {
    date = new Date()
  }
  console.log(date)
  var arrSubPitch = []
  Pitch.findOne({_id:pitch_id}).then(data=>{
    if(data && data.subpitch){
      arrSubPitch = _.map(data.subpitch, (e) => {
        return mongoose.Types.ObjectId(e)
      })
     // arrSubPitch = data.subpitch
    }
    console.log(arrSubPitch)
    SummaryBookPitchDay.aggregate([{
      $match: {
        $and: [
          { day: date.getDate() },
          { month: date.getMonth() + 1 },
          { year: date.getFullYear() },
          { subpitch_id : { $in: arrSubPitch}}
        ]
      }
    },
    {
      $group: {
        _id: {
          day: "$day",
          month: "$month",
          year: "$year",
        }, total: { $sum: "$total" },
        users:{$addToSet:"$users"},
        revenue:{
          $sum:"$revenue"
        }
  }
    }])
      .then(doc => {
        console.log(doc)
        var users = []
        var revenue = 0
        if(doc && doc.length){
          users = _.spread(_.union)(doc[0].users);
          revenue = doc[0].revenue
        }else {
          users = [];
          revenue = 0
        }
        if (doc.length === 0) {
          total = 0
        } else total = doc[0].total
  
        res.status(200).json({
          total : total,
          users: users,
          revenue: revenue
        })
      })
      // .catch(function (err) {
      //   res.status(400).json({ msg: "error", details: err });
      // })
  })
  
})

//bieu do ticket theo ngay
router.get('/datachartbyday', function (req, res, next) {
  const startDate = +new Date(req.query.daystart + " 0:0:0") / 1000 / 60 / 60
  const endDate = +new Date(req.query.dayend + " 23:59:59") / 1000 / 60 / 60
  //distance is number of day between startDate and endDate 
  const distance = Math.ceil((endDate - startDate) / 24)
  var ArrFullDate = []
  var Arr = []
  var pitch_id = req.query.pitch_id
  for (let i = 0; i < distance; i++) {
    var date = new Date(req.query.daystart)
    date.setDate(date.getDate() + i)
    var formatDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    ArrFullDate.push(formatDate)
  }
 
  Pitch.findOne({_id:pitch_id}).then(data=>{
    if(data && data.subpitch){
      arrSubPitch = _.map(data.subpitch, (e) => {
        return mongoose.Types.ObjectId(e)
      })
    }
    SummaryBookPitchDay.aggregate([{
      $match: {
        $and: [
          {fullDate: { $gte: startDate, $lte: endDate }},
          {subpitch_id : { $in: arrSubPitch}}
        ]
      }
    },
    {
      $group: {
        _id: {
          day: "$day",
          month: "$month",
          year: "$year",
        },
        total: {
          $sum: "$total"
        },
        users:{$addToSet:"$users"},
        revenue:{
          $sum:"$revenue"
        }
      }
    }]).then(function (doc) {
      for (let i = 0; i < doc.length; i++) {
        Arr.push({
          date: doc[i]._id.year + "-" + doc[i]._id.month + "-" + doc[i]._id.day,
          total: doc[i].total,
          users:_.spread(_.union)(doc[i].users),
          revenue:doc[i].revenue
        })
      }
      for (let i = 0; i < ArrFullDate.length; i++) {
        var count = 0
        for (let j = 0; j < Arr.length; j++) {
          if (ArrFullDate[i] === Arr[j].date) {
            count++
          }
        }
        if (count === 0) {
          Arr.push({
            date: ArrFullDate[i],
            total: 0,
            users:[],
            revenue:0
          })
        }
      }
  
      return res.status(200).json(Arr.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date)  //sap xep ngay tang dan
      }))
  
    }).catch(function (err) {
      res.status(400).json({ msg: "error", details: err });
    })
  })
  
})

// //bieu do ticket theo gio
router.get('/datachartbyhour', function (req, res, next) {

  const startDate = +new Date(req.query.daystart + " 0:0:0") / 1000 / 60 / 60
  const endDate = +new Date(req.query.dayend + " 23:59:59") / 1000 / 60 / 60
  var pitch_id = req.query.pitch_id
  Pitch.findOne({_id:pitch_id}).then(data=>{
    if(data && data.subpitch){
      arrSubPitch = _.map(data.subpitch, (e) => {
        return mongoose.Types.ObjectId(e)
      })
    }
    SummaryBookPitchDay.aggregate([{
      $match: {
        $and: [
          {fullDate: { $gte: startDate, $lte: endDate }},
          {subpitch_id : { $in: arrSubPitch}}
        ]
      }
    },
    {
      $group: {
        _id: {
          hour: "$hour",
        },
        total: {
          $sum: "$total"
        },
        users:{$addToSet:"$users"},
      }
    }, { $sort: { _id: 1 } }
    ]).then(function (doc) {
  
      var fullHour = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
      var Arr = []
  
      for (let i = 0; i < doc.length; i++) {
        Arr.push({
          hour: doc[i]._id.hour,
          total: doc[i].total,
          users:_.spread(_.union)(doc[i].users),
          revenue:doc[i].revenue
        })
      }
  
      for (let i = 0; i < fullHour.length; i++) {
        var count = 0
        for (let j = 0; j < Arr.length; j++) {
          if (fullHour[i] === Arr[j].hour) {
            count++;
          }
        }
        if (count === 0) {
          Arr.push({
            hour: fullHour[i],
            total: 0,
            users:[],
            revenue:0
          })
        }
      }
      return res.status(200).json(Arr.sort(compare))
  
    }).catch(function (err) {
      res.status(400).json({ msg: "error", details: err });
    })
  })
})

//sap xep gio
function compare(a, b) {
  if (a.hour < b.hour) {
    return -1;
  }
  if (a.hour > b.hour) {
    return 1;
  }
  return 0;
}

module.exports = router;