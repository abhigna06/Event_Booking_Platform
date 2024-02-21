const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); 
const User = require('../models/User');
const Admin = require('../models/Admin'); 


async function updateEventCompletionStatusMiddleware(req, res, next) {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('bookings.eventId');

        // Logic to update event completion status
        if (user && user.bookings.length > 0) {
            const currentDateTime = new Date();
            for (const booking of user.bookings) {
                const eventDateTime = new Date(booking.eventId.date);
                const eventTimeParts = booking.eventId.time.split(':');
                let eventHour = parseInt(eventTimeParts[0], 10);
                const eventMinute = parseInt(eventTimeParts[1], 10);
                const eventAmPm = booking.eventId.time.split(' ')[1];
                if (eventAmPm === 'PM' && eventHour !== 12) {
                    eventHour += 12;
                } else if (eventAmPm === 'AM' && eventHour === 12) {
                    eventHour = 0;
                }
                eventDateTime.setHours(eventHour, eventMinute, 0, 0);

                if (eventDateTime < currentDateTime) {
                    // Event date is in the past
                    booking.eventId.completed = true;
                } else if (eventDateTime.getDate() === currentDateTime.getDate() &&
                    eventDateTime.getMonth() === currentDateTime.getMonth() &&
                    eventDateTime.getFullYear() === currentDateTime.getFullYear() &&
                    eventDateTime.getHours() <= currentDateTime.getHours() &&
                    eventDateTime.getMinutes() <= currentDateTime.getMinutes()) {
                    // Event date is today, but check if event time has passed
                    booking.eventId.completed = true;
                } else {
                    // Event is in the future
                    booking.eventId.completed = false;
                }
                await booking.eventId.save(); // Save the updated event
            }
        }
        // Just for debugging purpose
        const temp = await Event.find({ event_name: "Karthik Live" });
        console.log(temp[0].completed);

        next(); // Move to the next middleware or route handler
    } catch (error) {
        // Handle errors
        console.error('Error updating event completion status:', error);
        next(error); // Pass the error to the error handler middleware
    }
}




const adminUpdateEventCompletionStatusMiddleware = async (req, res, next) => {
    try {
        const adminId = req.params.adminId; 
        const admin = await Admin.findById(adminId);
        const events = await Event.find({ postedBy: adminId });

        if (events && events.length > 0) {
            const currentDate = new Date();
            for (const event of events) {
                const eventDate = new Date(event.date);
                const eventTimeParts = event.time.split(':');
                const eventHour = parseInt(eventTimeParts[0], 10);
                const eventMinute = parseInt(eventTimeParts[1], 10);
                const eventAmPm = event.time.split(' ')[1];
                if (eventAmPm === 'PM' && eventHour !== 12) {
                    eventHour += 12;
                } else if (eventAmPm === 'AM' && eventHour === 12) {
                    eventHour = 0;
                }
                eventDate.setHours(eventHour, eventMinute, 0, 0);

                if (eventDate < currentDate) {
                    // Event date is in the past
                    event.completed = true;
                } else if (eventDate.getDate() === currentDate.getDate() &&
                           eventDate.getMonth() === currentDate.getMonth() &&
                           eventDate.getFullYear() === currentDate.getFullYear() &&
                           eventDate.getHours() <= currentDate.getHours() &&
                           eventDate.getMinutes() <= currentDate.getMinutes()) {
                    // Event date is today, but check if event time has passed
                    event.completed = true;
                } else {
                    // Event is in the future
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
