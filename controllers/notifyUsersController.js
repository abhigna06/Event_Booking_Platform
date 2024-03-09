const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');
const User = require('../models/User');
const Event = require('../models/Event')

const scheduleNotification = async (req, res) => {
    const { eventId } = req.params;
    const { notificationOption } = req.body;

    try {
        // Find the event by ID
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const eventTime = moment(event.time, 'h:mm A');

        // Calculate the scheduled time based on the selected option
        let scheduledTime;
        if (notificationOption === '30 minutes') {
            scheduledTime = moment(event.date).set({ hour: eventTime.hours(), minute: eventTime.minutes() }).subtract(30, 'minutes');
        } else if (notificationOption === '1 hour') {
            scheduledTime = moment(event.date).set({ hour: eventTime.hours(), minute: eventTime.minutes() }).subtract(1, 'hour');
        } else if (notificationOption === '1 day') {
            scheduledTime =moment(event.date).set({ hour: eventTime.hours(), minute: eventTime.minutes() }).subtract(1, 'day');
        } else {
            return res.status(400).json({ message: 'Invalid notification option' });
        }
        console.log('Scheduled time:', scheduledTime.format('YYYY-MM-DD h:mm A'));
        console.log('Event:', event);

        console.log('Scheduled minutes:', scheduledTime.minutes());
        console.log('Scheduled hours:', scheduledTime.hours());


        console.log(scheduledTime.format('YYYY-MM-DD HH:mm:ss'));

        // Schedule the email using node-cron
        cron.schedule(scheduledTime.format('mm HH DD MM *'), async () => {
            try {
                const useremail =req.user.email;
                const user = await User.findOne ({email : useremail});
                if (!user) {
                    return console.log('User not found');
                }

                // Send email notification
                sendEmail(useremail, event);
            } catch (error) {
                console.error('Error sending email:', error);
            }
        });
        console.log('scheduled email');
        res.json({ result:'success', message: 'Notification scheduled ' });
    } catch (error) {
        console.error('Error scheduling notification:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Function to send email notification
async function sendEmail(email, event) {
    try{
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'hotmail',
          auth: {
            user: process.env.OUTLOOK_USER, 
            pass: process.env.PASSWORD,
          }
    });

    // Email options
    const mailOptions = {
        from: process.env.OUTLOOK_USER,
        to: email,
        subject: 'Event NReminder',
        text: `Get ready to have fun at "${event.event_name}  on ${new Date(event.date).toLocaleDateString() } , ${event.time}. \n See you at ${event.event_location.venue}, ${event.event_location.area}, ${event.event_location.city}.`,
    };

    // Send email
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', email,info.response);
        }
    });
}

catch(e){
    console.log(e);
}
}



module.exports = {
    scheduleNotification
};
