var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var User = require('../models/user')

//dang ky
router.post('/register', function (req, res, next) {
  User.findOne({ $or: [{ username: req.body.username, email: req.body.email }] })
    .then(doc => {
      if (doc) {
        return res.status(501).json({ msg: "Username or password is exist" })
      } else {
        var user = new User({
          email: req.body.email,
          username: req.body.username,
          password: User.hashPassword(req.body.password),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_number: req.body.phone_number,
          permission: req.body.permission
        })

        let promise = user.save();

        promise.then(function (doc) {
          return res.status(201).json(doc)
        })

        promise.catch(function (err) {
          return res.status(501).json({ msg: "Error regsitering user" })
        })
      }
    })
})

// dang nhap
router.post('/login', function (req, res, next) {
  let promise = User.findOne({ $or: [{ email: req.body.user }, { username: req.body.user }] }).exec();
  promise.then(function (doc) {
    if (doc) {
      console.log(doc.isValid(req.body.password))
      if (doc.isValid(req.body.password)) {
        let token = jwt.sign({ username: doc.username }, 'davylaw', { expiresIn: '3h' })
        return res.status(201).json(token)
      } else return res.status(401).json({ msg: "Invalid Credentials" })
    }
    return res.status(501).json({ msg: "Username or email was not registered" })
  })
  promise.catch(function (err) {
    return res.status(501).json({ message: 'Some internal error' })
  })
})

router.get('/getUser', verifyToken, function (req, res, next) {
  let promise = User.findOne({ username: decodedToken.username }).exec();
  promise.then(function (doc) {
    req.session.user_id = doc._id
    req.session.permission = doc.permission
    res.status(200).json({ username: decodedToken.username, permission: doc.permission })
  })
})

var decodedToken = ''
function verifyToken(req, res, next) {
  let token = req.query.token;
  jwt.verify(token, 'davylaw', function (err, tokendata) {
    if (err) {
      return res.status(400).json({ msg: "Unauthorized request" })
    }
    if (tokendata) {
      decodedToken = tokendata;
      next()
    }
  })
}

router.get('/logout', function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      res.status(400).json({ msg: "Logout failed" })
    } else {
      res.status(200).json({ msg: "Logout success" })
    }

  });
})

router.get('/:id', function (req, res, next) {
  let promise = User.findOne({ _id: req.params.id }).exec();

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ message: err })
  })
})

router.post('/update/:id', function (req, res, next) {
  let promise = User.updateOne({ _id: req.params.id },
    {
      $set: {
        first_name: req.body.first_name, last_name: req.body.last_name,
        phone_number: req.body.phone_number, password: User.hashPassword(req.body.password),
        updatedAt: Date.now()
      }
    }).exec()

  promise.then(function (doc) {
    return res.status(201).json(doc)
  })

  promise.catch(function (err) {
    return res.status(501).json({ message: err })
  })
})

module.exports = router
