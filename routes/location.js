var express = require('express');
var router = express.Router();

var District = require('../models/district')
var City = require('../models/city')

router.get('/city', function (req, res, next) {
    City.find().then(data => {
        return res.status(200).json(data)
    }).catch(err =>{
        console.log(err)
        return res.status(400).json(err)
    })
})

router.get('/district', function (req, res, next) {
    District.find({city_id : req.query.city}).then(data => {
        return res.status(200).json(data)
    }).catch(err =>{
        return res.status(400).json(err)
    })
})

module.exports = router;
