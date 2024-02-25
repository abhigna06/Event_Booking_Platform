const { Int32 } = require("mongodb");
var mongoose = require("mongoose");
const Admin = require("./Admin");


const event_locationSchema = new mongoose.Schema({
    venue: { type : String, required: true},
    area: { type : String, required: true},
    city: { type : String, required: true},
})
event_locationSchema.index({ city: 'text' });``

const eventSchema = new mongoose.Schema({
    event_name: { type : String, required: true,},
    event_location: event_locationSchema,
    host: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },   
    // eventImage: {
    //     data: Buffer,
    //     contentType: String,
    // },
    eventImage: { type: String },
    no_of_tickets:{ type : Number, required: true,},
    ticketsSold: { type: Number, default:0},
    postedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    completed: { type: Boolean, default: false },
    ticketPrice : { type: Number, default:0},

});

// eventSchema.pre('save', eventMiddleware.setCompletedFlag);

// eventSchema.pre('save', function(next) {
//     const currentDate = new Date();
//     if (this.date < currentDate) {
//         this.completed = true;
//     } else {
//         this.completed = false;
//     }
//     next();
// });


const Event = mongoose.model('events', eventSchema);
module.exports = Event;