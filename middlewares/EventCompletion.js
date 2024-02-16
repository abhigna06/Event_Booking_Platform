const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); 
const User = require('../models/User');
const Admin = require('../models/Admin'); 

// Middleware to update event completion status based on user's bookings
const updateEventCompletionStatusMiddleware = async (req, res, next) => {
    try {
        const userId = req.params.userId; 
        const user = await User.findById(userId).populate('bookings.eventId'); 
         console.log(user.bookings.eventId);
        // Logic to update event completion status
        if (user && user.bookings.length > 0) {
            const currentDate = new Date();
            for (const booking of user.bookings) {
                console.log(booking);
                if (booking.eventId.date < currentDate) {
                    booking.eventId.completed = true;
                } else {
                    booking.eventId.completed = false;
                }
                await booking.eventId.save(); // Save the updated event
            }
        }

        next(); // Move to the next middleware or route handler
    } catch (error) {
        // Handle errors
        console.error('Error updating event completion status:', error);
        next(error); // Pass the error to the error handler middleware
    }
};

const adminUpdateEventCompletionStatusMiddleware = async (req, res, next) => {
    try {
        const adminId = req.params.adminId; 
        const admin = await Admin.find({ _id: adminId });
        const events = await Event.find({ postedBy: adminId });
        // Logic to update event completion status
        if (events && events.length > 0) {
            const currentDate = new Date();
            for (const event of events) {
                
                if (event.date < currentDate) {
                    event.completed = true;
                } else {
                    event.completed = false;
                }
                await event.save(); 
            }
        }

        next(); // Move to the next middleware or route handler
    } catch (error) {
        // Handle errors
        console.error('Error updating event completion status:', error);
        next(error); // Pass the error to the error handler middleware
    }
};


module.exports = {updateEventCompletionStatusMiddleware, adminUpdateEventCompletionStatusMiddleware};
