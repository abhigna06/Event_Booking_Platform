var express = require('express');
var router = express.Router();
var User = require('../models/User.js')
var Admin = require('../models/Admin.js')
var Event = require('../models/Event.js')
router.use(express.static("./public"));
/* GET home page. */
router.get('/', async function(req, res, next) {
  const events = await Event.find();
  const users = await User.find();
  const admins = await Admin.find();
    res.render('new_home', { title: 'Events', events : events, users:users, admins:admins});
  //res.render('home', { title: 'Express' });
});

module.exports = router;
