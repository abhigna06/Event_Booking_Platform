// const express = require('express');
// const Event = require('./Event');
// // Define a function to update completion status of events
// async function updateEventCompletionStatus() {
//     try {
//       const currentDate = new Date();
//       // Find events with date in the past and not marked as completed
//       const eventsToUpdate = await Event.find({
//         date: { $lt: currentDate },
//         completed: false
//       });
//       // Update completion status of events
//       for (const event of eventsToUpdate) {
//         event.completed = true;
//         await event.save();
//       }
//       console.log('Event completion status updated successfully.');
//     } catch (error) {
//       console.error('Error updating event completion status:', error);
//     }
//   }
  
//   // Set up a scheduler to periodically execute the function (e.g., every hour)
// setInterval(updateEventCompletionStatus, 1000000); 
// module.exports = updateEventCompletionStatus;
  