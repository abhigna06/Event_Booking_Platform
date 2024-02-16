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

const {adminUpdateEventCompletionStatusMiddleware} = require('../middlewares/EventCompletion');
const { deleteFile,
  uploadFileToS3 } = require('../services/uploadToS3');
const { addAdmin, sendCredentials, manageAdmins, deleteAdmin } = require("../controllers/mainAdminController");
const { gettingAdminDetails } = require("../models/adminLoginModels");
const { check, validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const { configDotenv } = require('dotenv');

const cookieMaxAge = 30000000;
const jwtSecret = "keyboard cat";

router.use(cookieParser())

const createToken = (username) => {
  const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
};

function adminLogin (req, res, next) {

  try {
    res.render('admin_login');
  }
  catch (e) {
    console.log(e)
  }
}


async function adminValidate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alertError = errors.array()
      res.json({
        alertError: alertError
      });
    }
    else {
      const result1 = await gettingAdminDetails(req.body.username)
      console.log(req.body);
      if (result1 == null) {
        res.json({
          result: 'admin-not-found', msg: 'Login with valid username'
        })
      }
      else {
        const pw = await bcrypt.compare(req.body.password, result1.password);
        if (pw) {
          const token = createToken(req.body.username);
          res.cookie('jwt', token, { maxAge: cookieMaxAge, httpOnly: true });

          res.json({
            result: 'redirect', url: '/admins/dashboard'
          })
        }
        else {
          res.json({
            result: 'password-wrong', msg: 'Enter Correct Password'
          })
        }
      }
    }
  }
  catch (e) {
    console.log(e)
  }
}

function adminLogout (req, res, next) {
    try {
      res.clearCookie('jwt');
      res.redirect('/');
    } catch (e) {
      console.log(e)
    }
}

module.exports = {adminLogin, adminValidate, adminLogout}
