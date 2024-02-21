const { expect } = require('chai');
const sinon = require('sinon');
const { eventDetails } = require('../controllers/userActionController');
const Event = require('../models/Event');

describe('Event Details Controller', () => {

    beforeEach(() => {
        // Restore the stubbed method before each test case
        sinon.restore();
    });

    it('should render event details view if event exists', async () => {
        // Mock request object
        const req = {
            params: { eventId: 'event_id' }
        };

        // Mock response object
        const res = {
            render: sinon.spy(),
            status: sinon.stub().returnsThis(),
            send: sinon.spy()
        };

        // Mock next function
        const next = sinon.spy();

        // Mock Event object
        const mockEvent = {
            _id: 'event_id',
            eventName: 'Test Event',
            // Add other properties as needed
        };

        // Stub Event.find() method to return the mock event
        sinon.stub(Event, 'find').resolves([mockEvent]);

        // Call the eventDetails function
        await eventDetails(req, res, next);

        // Check if Event.find() is called with the correct eventId
        expect(Event.find.calledOnceWithExactly({ _id: 'event_id' })).to.be.true;

        // Check if the render method is called with the correct view and data
        expect(res.render.calledOnce).to.be.true;
        expect(res.render.firstCall.args[0]).to.equal('eventDetails');
        expect(res.render.firstCall.args[1]).to.deep.equal({ event: [mockEvent] });

        // Ensure that status and send methods are not called
        expect(res.status.called).to.be.false;
        expect(res.send.called).to.be.false;
        
    });

    // it('should send "Event not found" message if event does not exist', async () => {
    //     // Mock request object
    //     const req = {
    //         params: { eventId: 'non_existing_event_id' }
    //     };

    //     // Mock response object
    //     const res = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.spy()
    //     };

    //     // Mock next function
    //     const next = sinon.spy();

    //     // Stub Event.find() method to return an empty array
    //     sinon.stub(Event, 'find').resolves([]);

    //     // Call the eventDetails function
    //     await eventDetails(req, res, next);

    //     // Check if Event.find() is called with the correct eventId
    //     expect(Event.find.calledOnceWithExactly({ _id: 'non_existing_event_id' })).to.be.true;

    //     // Check if the status and send methods are called with "Event not found" message
    //     expect(res.status.calledOnceWithExactly(404)).to.be.true;
    //     expect(res.send.calledOnceWithExactly('Event not found')).to.be.true;

    //     // Ensure that next function is not called
    //     expect(next.called).to.be.false;
    // });

    // it('should handle errors gracefully', async () => {
    //     // Mock request object
    //     const req = {
    //         params: { eventId: 'event_id' }
    //     };

    //     // Mock response object
    //     const res = {
    //         status: sinon.stub().returnsThis(),
    //         send: sinon.spy()
    //     };

    //     // Mock next function
    //     const next = sinon.spy();

    //     // Stub Event.find() method to throw an error
    //     const errorMessage = 'Database error';
    //     sinon.stub(Event, 'find').rejects(new Error(errorMessage));

    //     // Call the eventDetails function
    //     await eventDetails(req, res, next);

    //     // Check if the error is handled gracefully
    //     expect(res.status.calledOnceWithExactly(500)).to.be.true;
    //     expect(res.send.calledOnceWithExactly('Internal Server Error')).to.be.true;

    //     // Ensure that next function is not called
    //     expect(next.called).to.be.false;
    // });
});
