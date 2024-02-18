const { expect } = require('chai');
const sinon = require('sinon');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event'); // Assuming you have the Event model imported
const userActionController = require('../controllers/userActionController');

describe('User Action Controller - Book Tickets', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { email: 'test@example.com' },
      params: { eventId: 'event_id' },
      body: { no_of_tickets: '2' }
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

  it('should handle unavailable tickets', async () => {
    sinon.stub(Event, 'find').resolves([{ no_of_tickets: 0 }]);
    //requestedTickets=5;
    sinon.stub(User, 'find').resolves([{ bookings: [], save: sinon.stub() }]);

    await userActionController.bookTickets(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith({ result: 'Invalid no. of tickets', message: 'Tickets unavailable' })).to.be.true;
  });

  it('should book tickets successfully', async () => {
    sinon.stub(Event, 'find').resolves([{ no_of_tickets: 5, save: sinon.stub() }]);
    sinon.stub(User, 'find').resolves([{ bookings: [], save: sinon.stub() }]);

    await userActionController.bookTickets(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith({ result: 'success', message: 'Booking Successful' })).to.be.true;
  });
});
