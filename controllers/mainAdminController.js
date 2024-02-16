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

const { gettingAdminDetails } = require("../models/adminLoginModels");
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4:uuidv4 } = require('uuid');
const { configDotenv } = require('dotenv');

function addAdmin(req, res, next){
  
  try{
    res.render('add_admin');
  }
  catch(e){
    console.log(e)
  }
}

async function sendCredentials (req, res){
  try {
      // Generate random password
      const password = passwordGenerator(6, false); // Generates a 6-character random password

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user object with form data
      const newAdmin = new Admin({
          admin_username: req.body.name,
          admin_email: req.body.email,
          phone_no: req.body.phno,
          password: hashedPassword
      });

      // Save the new user to the database
      await newAdmin.save();

      // Send email with user's credentials
      const transporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            user: process.env.OUTLOOK_USER, 
            pass: process.env.PASSWORD,
          }
      });

      const mailOptions = {
          from: process.env.OUTLOOK_USER,
          to: req.body.email,
          subject: 'Your Admin Credentials',
          text: `Dear ${req.body.name},\n\nYou have been added as an admin in EventEase.\nHere are the login credentials\nUsername: ${req.body.name}\nPassword: ${password}\n\nPlease keep your credentials secure .\n\nBest regards,\nEventEase Team`
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
          } else {
              console.log('Email sent: ' + info.response);
              
          }
      });

      res.status(200).send('Admin credentials sent successfully');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
}

async function manageAdmins(req, res, next){
  
  try{
    const allAdmins = await Admin.find();
    //res.status(200).json(allAdmins);
    const admin_username = req.user.username;
    const admin = await Admin.find({ admin_username : admin_username});
    const events = await Event.find({postedBy : admin[0]._id});

    res.render('manage_admins',{allAdmins:allAdmins, admin : admin, events:events});

    
  }
  catch(e){
    console.log(e)
  }
}

async function deleteAdmin(req, res) {
  try {
    console.log("id");
    const adminId = req.params.id;
    // Ensure that the admin being deleted is not the main admin (you can add more robust checks if needed)
    admin_username = req.user.username;

    const mainAdmin = await Admin.find({admin_username : admin_username});
    if (adminId === mainAdmin[0]._id) {
      return res.status(400).json({ error: 'Cannot delete main admin' });
    }
    else{
    // Delete the admin from the database
    await Admin.findByIdAndDelete(adminId);
    res.status(200).json({ message: 'Admin deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { addAdmin, sendCredentials, manageAdmins, deleteAdmin }