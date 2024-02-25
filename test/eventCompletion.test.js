const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const { updateEventCompletionStatusMiddleware, adminUpdateEventCompletionStatusMiddleware } = require('../middlewares/EventCompletion');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Event = require('../models/Event');

describe('updateEventCompletionStatusMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: { userId: 'user123' }
        };
        res = {};
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    })

    it('should call next if no bookings', async () => {
        sinon.stub(User, 'findById').resolves({ bookings: [] });

        await updateEventCompletionStatusMiddleware(req, res, next);

        expect(next.calledOnce).to.be.true;
        
    });

    // it('should set completion status to true for past events', async () => {
    //     const pastevent = [{ date: '2022-01-01', time: '12:00 PM' }];
    //     sinon.stub(User, 'findById').resolves({ bookings: [{ eventId: pastevent }] });
    //     sinon.stub(Event.prototype, 'save');

    //     await updateEventCompletionStatusMiddleware(req, res, next);

    //     expect(Event.prototype.save.calledWithMatch({ completed: true })).to.be.true;
    //     expect(next.calledOnce).to.be.true;
        
    // });

    // it('should update event completion status for past events', async () => {
    //     const pastEvent = { _id: 'test_id', date: new Date('2022-01-01'), time: '12:00 PM' };
    //     sinon.stub(User, 'findById').resolves({
    //         populate: () => ({ 
    //             exec: async() => ({ bookings: [{ eventId: pastEvent }] })
    //         })
    //     })
    //     const saveStub = sinon.stub(Event.prototype, 'save');

    //     await updateEventCompletionStatusMiddleware(req, res, next);

    //     expect(saveStub.calledOnce).to.be.true;
    //     expect(saveStub.calledWithMatch({ _id: pastEvent._id, completed: true })).to.be.true;
    //     expect(next.calledOnce).to.be.true;
    // });

    // it('should set completion status to false for future events', async () => {
    //     const tomorrow = new Date();
    //     tomorrow.setDate(tomorrow.getDate() + 1);
    //     const event = { date: tomorrow.toISOString(), time: '12:00 PM' };

    //     const populateStub = sinon.stub().resolves({ bookings: [{ eventId: { date: '2022-01-01', time: '12:00 PM' } }] });
       

    //     sinon.stub(User, 'findById').resolves({ populate: populateStub });
    //     sinon.stub(Event.prototype, 'save');

    //     await updateEventCompletionStatusMiddleware(req, res, next);

    //     expect(Event.prototype.save.calledWithMatch({ completed: false })).to.be.true;
    //     expect(next.calledOnce).to.be.true;
        
    // });

    
});

describe('adminUpdateEventCompletionStatusMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { params: { adminId: 'admin_id' } };
        res = {};
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });


    it('should call next if no events', async () => {
        sinon.stub(Admin, 'findById').resolves({ eventsPosted: [] });
        //sinon.stub(Event, 'find').resolves([{postedBy: 'admin_id'}]);
       
        await adminUpdateEventCompletionStatusMiddleware(req, res, next);

        expect(next.calledOnce).to.be.true;
        
    });

    // it('should update event completion status for past events', async () => {
    //     const pastEvent = { _id: 'test_id', date: new Date('01-01-2022'), time: '12:00 PM' , postedBy: req.params.adminId };
    //     //sinon.stub(Admin, 'findById').resolves({ _id: req.params.adminId , eventsPosted: [{ _id: 'test_id', date: new Date('01-01-2022'), time: '12:00 PM', }] });
    //     sinon.stub(Event, 'find').resolves([pastEvent]);
    //     //sinon.stub(Event, 'find').resolves([{ postedBy: 'admin_id' }]);
    //     const saveStub = sinon.stub(Event.prototype, 'save');

    //     await adminUpdateEventCompletionStatusMiddleware(req, res, next);

    //     expect(saveStub.calledOnce).to.be.true;
    //     expect(saveStub.calledWithMatch({ _id: pastEvent._id, completed: true })).to.be.true;
    // });

    // it('should update event completion status for future events', async () => {
    //     const futureEvent = { _id: 'test_id', date: new Date('2024-01-01'), time: '12:00 PM' };
    //     sinon.stub(Admin, 'findById').resolves({ _id: req.params.adminId });
    //     sinon.stub(Event, 'find').resolves([{ _id: 'test_id', date: new Date('2024-01-01'), time: '12:00 PM', save: sinon.stub().resolves(), }]);
    //     const saveStub = sinon.stub(Event.prototype, 'save');

    //     await adminUpdateEventCompletionStatusMiddleware(req, res, next);

    //     expect(saveStub.calledOnce).to.be.true;
    //     expect(saveStub.calledWithMatch({ _id: futureEvent._id, completed: false })).to.be.true;
    // });

    it('should not update event completion status for events not posted by the admin', async () => {
        const otherAdminId = 'other_admin_id';
        const eventNotPostedByAdmin = { _id: 'test_id', date: new Date('2023-01-01'), time: '12:00 PM', postedBy: otherAdminId };
        sinon.stub(Admin, 'findById').resolves({ _id: req.params.adminId });
        sinon.stub(Event, 'find').resolves([eventNotPostedByAdmin]);
        const saveStub = sinon.stub(Event.prototype, 'save');

        await adminUpdateEventCompletionStatusMiddleware(req, res, next);

        expect(saveStub.called).to.be.false;
    });

});
