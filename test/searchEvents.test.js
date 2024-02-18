
const sinon = require('sinon');
const { expect } = require('chai');
const Event = require('../models/Event')
const { searchEvents } = require('../controllers/userActionController'); // Assuming the function is exported from eventController

describe('Search Events', () => {
  it('should return matching events', async () => {
    // Mock req and res objects
    const req = {
      query: {
        searchTerm: 'example'
      }
    };
    const res = {
      json: sinon.spy(),
    //   status: sinon.stub().returns({ json: sinon.spy() })
    };

    // Mock the Event.aggregate method to return some dummy data
    const dummyEvents = [{ event_name: 'Example Event', host: 'Example Host' }];
    const eventAggregateStub = sinon.stub(Event, 'aggregate').resolves(dummyEvents);
    //const Event = { aggregate: sinon.stub().resolves(dummyEvents) };

    // Call the function with the mock req, res, and Event objects
    await searchEvents(req, res, Event);

    // Verify that res.json is called with the dummy events
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith(dummyEvents)).to.be.true;

    eventAggregateStub.restore();
  });
});
