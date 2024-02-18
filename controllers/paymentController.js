const Razorpay = require('razorpay'); 
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

var User = require('../models/User');
var alert = require('alert'); 
var Event = require('../models/Event');

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});

const renderProductPage = async(req,res)=>{

    try {
        
        res.render('product');

    } catch (error) {
        console.log(error.message);
    }

}

const createOrder = async(req,res)=>{
    try {

        const { no_of_tickets, ticketPrice } = req.body;
        const amount = (no_of_tickets * ticketPrice)/2 * 100;
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }
        console.log('entered');

        razorpayInstance.orders.create(options, 
            (err, order)=>{
                if(!err){
                    res.status(200).send({
                        success:true,
                        msg:'Order Created',
                        order_id:order.id,
                        amount:amount,
                        key_id:RAZORPAY_ID_KEY,
                        product_name:'My product',
                        description:'abc',
                        contact:"6300353881",
                        name: "Abhigna",
                        email: "abhignareddytalasani@gmail.com"
                    });
                }
                else{
                    res.status(400).send({success:false,msg:'Something went wrong!'});
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
}

const handlePaymentSuccess = async (req, res) => {

    try {
        console.log(req.user);
        const { eventId, amount, ticketsCount } = req.body;

        // Update the number of available tickets in the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (ticketsCount > event.no_of_tickets) {
            return res.status(400).json({ success: false, message: 'Tickets unavailable' });
        }

        event.no_of_tickets -= ticketsCount;
        event.ticketsSold += ticketsCount;
        await event.save();

        // Update the user's booking information
        const user_email = req.user.email;
        const user = await User.findOne({ email: user_email });
        user.bookings.push({ eventId, ticketsCount });
        await user.save();

        // Respond with success message
        res.status(200).json({ success: true, message: 'Booking successful' });
        res.render('success');
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).send('Internal server error');
    }
};


module.exports = {
    renderProductPage,
    createOrder,
    handlePaymentSuccess,
}