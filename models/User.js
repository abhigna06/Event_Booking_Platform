var mongoose = require("mongoose");
const Event = require('./Event');

const bookingsSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: Event, },
    ticketsCount: { type : Number, },
})


const userSchema = new mongoose.Schema({
    name: { type : String, required: true,},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bookings: [bookingsSchema],
});

const User = mongoose.model('users', userSchema);
module.exports = User;