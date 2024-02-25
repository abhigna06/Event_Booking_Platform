var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/User');
var alert = require('alert'); 
var Event = require('../models/Event');
const session = require('express-session');

router.use(express.static("./public"));

const { register, login, validate, newuser, logout, } = require('../controllers/userLoginController');
const {userHome, searchEvents, filterEventsByDate, eventDetails, bookTickets, userBookings ,cancelBooking, settings, updateProfile } = require('../controllers/userActionController');
const {updateEventCompletionStatusMiddleware } = require('../middlewares/EventCompletion')
const {scheduleNotification} = require('../controllers/notifyUsersController')
const { check, validationResult } = require('express-validator');
const { gettingUserDetails, newUserDB } = require('../models/userLoginModels');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4:uuidv4 } = require('uuid');

const verifyToken = require('../middlewares/tokenVerification');


const cookieMaxAge = 30000000;
const jwtSecret = "keyboard cat"; 

router.use(cookieParser())


const createToken = (email) => {
  const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', register);

router.get('/login', login);

router.post('/validate', validate);

router.post('/newuser', newuser);

router.get('/user_home/:city?', verifyToken, userHome);

router.get('/searchEvents', searchEvents);

router.get('/filterEventsByDate', updateEventCompletionStatusMiddleware, filterEventsByDate);

router.get('/eventDetails/:eventId', verifyToken, eventDetails);

router.post('/bookTickets/:eventId', verifyToken, bookTickets);

router.get('/myBookings/:userId', verifyToken, updateEventCompletionStatusMiddleware, userBookings);

router.post('/notify/:eventId', verifyToken, scheduleNotification);

router.post('/cancelBooking/:eventId', verifyToken, cancelBooking);

router.get('/settings/:userId',verifyToken, settings);

router.post('/updateProfile/:userId', verifyToken, updateProfile);

router.get('/logout', logout);


module.exports = router;
