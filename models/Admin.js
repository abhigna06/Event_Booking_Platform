var mongoose = require("mongoose");
const Event = require('./Event');

const eventsPostedSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
});


const adminSchema = new mongoose.Schema({
    admin_username: { type : String, required: true, unique:true},
    admin_email: { type: String, required: true, unique:true,},
    password: { type: String, required: true },
    phone_no: { type: Number},
    eventsPosted: [eventsPostedSchema]
});

const Admin = mongoose.model('admins', adminSchema);
module.exports = Admin;
