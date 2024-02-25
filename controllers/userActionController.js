var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var alert = require('alert'); 
var User = require('../models/User');
var Event = require('../models/Event');
router.use(express.static("./public"));
const {updateEventCompletionStatusMiddleware } = require('../middlewares/EventCompletion')
const { check, validationResult } = require('express-validator');


async function userHome(req, res, next){
    try{
      const currentDate = new Date();
  
      let events = await Event.find();
      for(let i=0;i<events.length;i++){
        if(events[i].date < currentDate){
          events[i].completed = true;
        }
      }
      console.log(events);
      // const cities = [...new Set(events.map(event => event.event_location.city))]; 
      const cities = await Event.distinct("event_location.city");
      const userEmail = req.user.email;  
      const user = await User.find({email:userEmail});
      console.log(user);
     // console.log(user[0].name);
  
     if(req.params.city) {
      // If city parameter is provided, filter events by city
        const city = req.params.city;
        events = await Event.find({'event_location.city' : city, completed:false});
      } else {
        // If no city parameter provided, fetch all events after current date
        events = await Event.find( {completed: false});
      }
      res.render('user_home', { title: 'Events', events : events , cities:cities, user});
    }
    catch(e){
      console.log(e)
    }
}

async function searchEvents (req, res) {
    // try {
    //     const { searchTerm } = req.query;
    //     //console.log(searchTerm);
    //     console.log(req.query);
  
    //     //case-insensitive search term
    //     const regex = new RegExp(searchTerm, 'i');
    //     const currentDate = new Date();
        
    //   const events = await Event.aggregate([
    //     {
    //       $match: {
    //         $or: [
    //           { "event_name": { $regex: regex } }, 
    //           { "host": { $regex: regex } } 
    //         ],
    //         $and: [{"date" : {$gte: currentDate}}],
    //       }
    //     }
    //   ]);

    //     console.log(events);
    //     res.json(events);
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Internal Server Error' });
    // }
    const { searchTerm } = req.query;
    const searchQuery = [
      {
        $search: {
          index: "searchEvents",
          text: {
            query: searchTerm,
            path: {
              wildcard: "*"
            }
          }
        }
      }
    ];

    Event.aggregate(searchQuery)
      .then(results => {
        // Process the search results
        console.log(results);
        // Send the results to the client or perform any other operation
        res.json(results);
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      });
}

async function filterEventsByDate(req, res){
  
    try {
      const { startDate, endDate } = req.query;
      // Convert start and end dates to JavaScript Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Query events within the date range
      const filteredEvents = await Event.find({ date: { $gte: start, $lte: end }, completed: false });
      res.json(filteredEvents);
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal Server Error' });
      }
}

async function eventDetails(req, res, next) {
    try {
      const eventId = req.params.eventId;
      const event = await Event.find({_id:eventId});
      
      if (!event) {
        return res.status(404).send('Event not found');
      }
      
      console.log(eventId);
      res.render('eventDetails', { event: event });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
}

async function bookTickets(req, res, next) {
    console.log(req);
    const user_email = req.user.email;
    console.log(user_email);
    const user = await User.find({ email : user_email});
    const eventId = req.params.eventId;
    
    const requestedTickets = parseInt(req.body.no_of_tickets) || 0;
   
    try {
  
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        const alertError = errors.array()
        res.json({
          alertError:alertError
        });
      }
      else{
      // Retrieve the event from the database
      const event = await Event.find({_id:eventId});
  
      // Check if the event exists
      // if (!event) {
      //     return res.status(404).json({ success: false, message: 'Event not found' });
      // }
  
      // Check if requested tickets are available
      if (requestedTickets > event[0].no_of_tickets) {
          res.json({ result:'Invalid no. of tickets' , message: 'Tickets unavailable' });
      }
      else{
      // Update the number of available tickets
      event[0].no_of_tickets -= requestedTickets;
  
      event[0].ticketsSold+=requestedTickets;
      //event[0].ticketsSold 
      await event[0].save();
      // Respond with success message
      console.log(user);
      res.json({ result:'success' , message:'Booking Successful' });
      console.log(user);
      console.log(requestedTickets);
      
      user[0].bookings.push({eventId, ticketsCount: requestedTickets});
      await user[0].save();
    }
  }
  } catch (error) {
      console.error(error);
      //res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

async function userBookings(req, res, next) {
    try{
      const userId = req.params.userId; 
      const user = await User.find({_id: userId}).populate('bookings.eventId');
      // const user = await User.find(userId).populate({
      //   path: 'bookings.eventId',
      //   match: { completed: false } // Filter only upcoming events
      // });
      //console.log(user[0].bookings);
      res.render('userBookings', { user: user});
    }
    catch(e){
      console.log(e)
    }
  
}

async function cancelBooking(req, res, next) {
    try{
      console.log(req);
      const user_email = req.user.email;
      console.log(user_email);
      const user = await User.find({ email : user_email});
      const bookingId = req.params.eventId;
      
      const booking = user[0].bookings.find(booking => booking._id.toString() === bookingId);
      console.log(booking);
      const eventId = booking.eventId;
      if (!booking) {
          return res.status(404).json({ message: 'Booking not found' });
      }
    
      // Update the no_of_tickets and ticketsSold in the corresponding event
      const event = await Event.find({_id:eventId});
      event[0].no_of_tickets += booking.ticketsCount;
      event[0].ticketsSold -= booking.ticketsCount;
      await event[0].save();
      console.log(event);
  
      // Remove the booking from the user's bookings array
      user[0].bookings = user[0].bookings.filter(booking => booking._id.toString() !== bookingId);
      await user[0].save();
  
      res.json({ result:'success' , message:'Booking Cancelled Successfully' });
    } catch (error) {
      console.error(error);
      res.json({ result:'failure' , message:'Booking Cancellation Failed' });
    }
}

async function settings(req, res, next) {
    try{
      // const userEmail = req.user.email;  
      // const user = await User.find({email:userEmail});
      const userId = req.params.userId; 
      const user = await User.find({_id: userId});
      
      res.render('userSettings', { user: user});
    }
    catch(e){
      console.log(e)
    }
  
}

async function updateProfile(req, res, next) {
    try{
      const user_email = req.user.email; 
      const user = await User.find({email: user_email});
      // const userId = req.params.userId; 
      // const user = await User.find({_id: userId});
      const { name, currentPassword, newPassword, confirmPassword } = req.body;
      console.log(req.body);
      if (newPassword && currentPassword) {
        const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!passwordMatch) {
          res.json({
            result: 'wrong-password', msg:'Enter Correct Current Password'
          })
        }
  
        else if(newPassword !== confirmPassword){
          res.json({
            result: 'passwords-doesnot-match', msg:'New password and current password doesnot match'
          })
        }
        else{
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user[0].password = hashedPassword;
        }
      }
  
      // Update the name if provided
      if (name) {
        user[0].name = name;
      }
  
      // Save the updated user details
      await user[0].save();
      
  
      // Respond with success message
      res.json({
        result: 'success', msg:'Profile updated successfully'
      })
      
    }
    catch(e){
      console.log(e)
    }
  
}



module.exports = {userHome, searchEvents, filterEventsByDate, eventDetails, bookTickets, userBookings, cancelBooking, settings, updateProfile} ;