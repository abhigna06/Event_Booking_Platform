var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var Admin = require('../models/Admin')
var Event = require('../models/Event')
const Chart = require('chart.js/auto');

const { 
    uploadFileToS3 } = require('../services/uploadToS3');

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

async function adminDashboard (req, res, next) {
    try {
  
      const allAdmins = await Admin.find();
      // const events = await Event.find();
      // console.log(events);
      console.log(req.user);
      const admin_username = req.user.username;
      const admin = await Admin.find({ admin_username: admin_username });
      ///  console.log(admin);
      const events = await Event.find({ postedBy: admin[0]._id });

      const ticketSalesData = await Event.aggregate([
        { $match: { postedBy: admin[0]._id } }, // Match events posted by the admin
        { $group: { _id: '$event_name', totalTicketsSold: { $sum: '$ticketsSold' } } } // Group by event name and calculate total ticket sales
      ]);

      const eventNames = ticketSalesData.map(data => data._id); // Array of event names
      const ticketSales = ticketSalesData.map(data => data.totalTicketsSold);

      res.render('admin_dashboard', { title: 'Events', events: events, admin: admin, allAdmins, eventNames, ticketSales });
    }
    catch (e) {
      console.log(e)
    }
}

async function postEvent(req, res, next) {
    try {
      res.render('post_event');
    }
    catch (e) {
      console.log(e)
    }
}

async function newEvent(req, res, next) {
    try{
    console.log(req.file);
  
    const admin_username = req.user.username;
    const admin = await Admin.find({ admin_username: admin_username });
    console.log(admin);
    const adminId = admin[0]._id;
    //console.log('Request:', req.body, req.file);
    const { event_name, venue, area, city, host, time, date, description, no_of_tickets, ticketPrice } = req.body;
    const url = await uploadFileToS3(process.env.AWS_BUCKET_NAME, req.file);
    console.log(url);
    //console.log(req.file); 
    const allAdmins = await Admin.find();
    
    
    
      var event_location = { venue, area, city };
      const event = new Event({
        event_name, event_location, host, time, date, description, no_of_tickets, ticketPrice, eventImage: url,
         postedBy: adminId
      });
     
      // event.postedBy = admin[0]._id;
      // const savedEvent = await event.save();
      await event.save();
      console.log(event);
      console.log(event._id);
      // const savedEventId = mongoose.Types.ObjectId(savedEvent._id);
      admin[0].eventsPosted.push({ eventId: event._id });
      await admin[0].save();
      console.log(admin[0].eventsPosted);
  
      if (!event) {
        return res.status(500).json({ message: 'Unexpected Error Occurred' });
      }
      const events = await Event.find({ postedBy: adminId });
      const ticketSalesData = await Event.aggregate([
        { $match: { postedBy: admin[0]._id } }, // Match events posted by the admin
        { $group: { _id: '$event_name', totalTicketsSold: { $sum: '$ticketsSold' } } } // Group by event name and calculate total ticket sales
      ]);

      const eventNames = ticketSalesData.map(data => data._id); // Array of event names
      const ticketSales = ticketSalesData.map(data => data.totalTicketsSold);

      // Respond with JSON for API requests
      // res.status(201).json({ user: savedUser });
      res.render('admin_dashboard', { admin: admin, events, allAdmins, eventNames, ticketSales  });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Unexpected Error Occurred' });
    }
}

async function adminEvents(req, res, next) {
    try {
      const adminId = req.params.adminId;
      const admin = await Admin.find({ _id: adminId });
  
      const events = await Event.find({ postedBy: adminId });
      console.log(events);
  
      res.render('adminEvents', { admin: admin, events: events });
    }
    catch (e) {
      console.log(e)
    }
}

async function settings(req, res, next) {
    try {
      // const userEmail = req.user.email;  
      // const user = await User.find({email:userEmail});
      const adminId = req.params.adminId;
      const admin = await Admin.find({ _id: adminId });
  
      res.render('adminSettings', { admin: admin });
    }
    catch (e) {
      console.log(e)
    }
  
}

async function updateProfile(req, res, next) {
    try {
      // const user_email = req.user.email; 
      // const user = await User.find({email: user_email});
      const adminId = req.params.adminId;
      const admin = await Admin.find({ _id: adminId });
      const { currentPassword, newPassword, confirmPassword } = req.body;
      console.log(req.body);
      const passwordMatch = await bcrypt.compare(currentPassword, admin[0].password);
      if (!passwordMatch) {
        res.json({
          result: 'wrong-password', msg: 'Enter Correct Current Password'
        })
      }
  
      else if (newPassword !== confirmPassword) {
        res.json({
          result: 'passwords-doesnot-match', msg: 'New password and current password doesnot match'
        })
      }
      else {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin[0].password = hashedPassword;
  
  
  
        // Save the updated user details
        await admin[0].save();
  
  
        // Respond with success message
        res.json({
          result: 'success', msg: 'Profile updated successfully'
        })
      }
  
    }
    catch (e) {
      console.log(e)
    }
  
}

async function cityChart (req, res, next){

  const admin_username = req.user.username;
  const admin = await Admin.find({ admin_username: admin_username });

  // Define an aggregation pipeline
  const pipeline = [
      {
          $group: {
              _id: '$event_location.city',
              totalEvents: { $sum: 1 }
          }
      }
  ];

  // Execute the aggregation pipeline
  Event.aggregate(pipeline)
      .then(results => {
          // Process the aggregated data for visualization
          const labels = results.map(item => item._id);
          const data = results.map(item => item.totalEvents);

          // Render the dashboard page with the aggregated data
          res.render('adminCityChart', { labels, data, admin });
      })
      .catch(error => {
          console.error('Error fetching aggregated data:', error);
          res.status(500).send('Internal Server Error');
      });
}

module.exports = {adminDashboard, postEvent, newEvent, adminEvents, settings, updateProfile, cityChart}