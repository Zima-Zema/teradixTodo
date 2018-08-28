var express = require('express');
var router = express.Router();
var { User } = require('../models/user');
var { authenticate } = require('../middleware/auth')
const _ = require('lodash');

router.post('/register', (req, res) => {
  console.log("regs route");
  
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
      return user.generateAuthToken();
      //res.status(201).send(user);
  }, (err) => {
      console.log("SaveError", err);
      res.status(404).send(err);

  }).then((token) => {
      res.status(201).header('x-auth', token).send(user);
  }, (err) => {
      console.log("tokenError", err);
      res.status(400).send(err);
  }).catch((e) => {
      console.log("exception", e);
      res.status(500).send(e);
  })

});

router.post('/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
          res.header('x-auth', token).send(user);
      })
  }).catch((ex) => {
      res.status(400).send();
  })
})

router.delete('/logout', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(()=>{
      res.status(200).send()
  },()=>{
      res.status(400).send();
  }).catch(()=>{
      res.status(400).send();
  })
})

router.get('/me', authenticate, (req, res) => {
  res.send(req.user);
})

module.exports = router;
