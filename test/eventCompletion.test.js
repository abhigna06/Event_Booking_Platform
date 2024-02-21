const { expect } = require('chai');
const sinon = require('sinon');
const { updateEventCompletionStatusMiddleware } = require('../middlewares/EventCompletion');
const User = require('../models/User');
const Event = require('../models/Event');

describe('Update Event Completion Status Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: { userId: 'user_id' }
        };
        res = {};
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should update event completion status for user with bookings', async () => {
        const user = {
            _id: 'user_id',
            bookings: [
                { eventId: { date: new Date('2024-02-15T12:00:00Z'), time: '12:00 PM', completed: false, save: sinon.spy() } },
                { eventId: { date: new Date('2024-02-20T12:00:00Z'), time: '12:00 PM', completed: false, save: sinon.spy() } }
            ]
        };

        sinon.stub(User, 'findById').resolves(user);

        await updateEventCompletionStatusMiddleware(req, res, next);

        expect(user.bookings[0].eventId.completed).to.be.true;
        expect(user.bookings[1].eventId.completed).to.be.false;

        expect(user.bookings[0].eventId.save.calledOnce).to.be.true;
        expect(user.bookings[1].eventId.save.calledOnce).to.be.true;

        expect(next.calledOnce).to.be.true;
    });

    it('should not update event completion status if user has no bookings', async () => {
        const user = {
            _id: 'user_id',
            bookings: []
        };

        sinon.stub(User, 'findById').resolves(user);

        await updateEventCompletionStatusMiddleware(req, res, next);

        expect(next.calledOnce).to.be.true;
    });

    
});
