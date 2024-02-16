var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Admin = require('../models/Admin')
var Event = require('../models/Event')
const session = require('express-session');
const nodemailer = require('nodemailer');
const passwordGenerator = require('password-generator');
//const dotenv = require('dotenv').config();

const {adminLogin, adminValidate, adminLogout} = require('../controllers/adminLoginController');
const { adminDashboard, postEvent, newEvent, adminEvents, settings, updateProfile } = require('../controllers/adminActionController')

const {adminUpdateEventCompletionStatusMiddleware} = require('../middlewares/EventCompletion');
const { deleteFile,
  uploadFileToS3 } = require('../services/uploadToS3');
const { addAdmin, sendCredentials, manageAdmins, deleteAdmin } = require("../controllers/mainAdminController");
const { gettingAdminDetails } = require("../models/adminLoginModels");
const { check, validationResult } = require('express-validator');
const path = require('path')
const multer = require('multer');
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
 
const upload = multer({ storage: storage });

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const { configDotenv } = require('dotenv');

const verifyToken = require('../middlewares/tokenVerification');

const cookieMaxAge = 30000000;
const jwtSecret = "keyboard cat";

router.use(cookieParser())

const createToken = (username) => {
  const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
};


/* GET home page. */
router.get('/', async function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/a_login', adminLogin);

router.post('/a_validate', adminValidate);

router.get('/dashboard', verifyToken, adminDashboard);

router.get('/post', verifyToken, postEvent);

router.post('/newevent', upload.single("filename"), verifyToken, newEvent);

router.get('/myEvents/:adminId', verifyToken, adminUpdateEventCompletionStatusMiddleware, adminEvents);

router.get('/addAdmin', verifyToken, addAdmin);

router.post('/sendCredentials', verifyToken, sendCredentials);

router.get('/manageAdmins', verifyToken, manageAdmins);

router.get('/delete/:id', verifyToken, deleteAdmin);

router.get('/settings/:adminId', verifyToken, settings);

router.post('/updateProfile/:adminId', verifyToken, updateProfile );

router.get('/logout', adminLogout);

module.exports = router;
