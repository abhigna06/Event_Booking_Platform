const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User');
const Event = require('../models/Event');
const userActionController = require('../controllers/userActionController');
const { response } = require('express');

describe('User Action Controller - Cancel Booking', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { email: 'test@example.com' },
      params: { eventId: 'booking_id' }
    };
    res = {
      json: sinon.spy(),
      status: sinon.stub().returns({ json: sinon.spy() })
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });



  it('should cancel booking successfully', async () => {
    const bookingId = 'booking_id';
    const eventId = 'event_id';
    const user = { bookings: [{ eventId, ticketsCount: 2 ,  _id: bookingId,  save: sinon.stub()}] };
    const event = { _id: eventId, no_of_tickets: 3, ticketsSold: 2 };

    sinon.stub(User, 'find').resolves([user]);
    sinon.stub(Event, 'find').resolves([event]);

    await userActionController.cancelBooking(req, res, next);
    console.log(event.ticketsSold);
    console.log(event.no_of_tickets);

    expect(event.no_of_tickets).to.equal(5); 
    expect(event.ticketsSold).to.equal(0); 
    
    //expect(res.json.calledOnce).to.be.true;
    //expect(res.json.calledWith({ result: 'success', message:'Booking Cancelled Successfully'})).to.be.true;
    
  });

  it('should handle errors', async () => {
    sinon.stub(User, 'find').rejects(new Error('Test error'));

    await userActionController.cancelBooking(req, res, next);

    expect(res.json.calledWith({ result: 'failure', message: 'Booking Cancellation Failed' })).to.be.true;
  });
});
