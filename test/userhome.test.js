const { expect } = require('chai');
const sinon = require('sinon');
const { userHome } = require('../controllers/userActionController');
const Event = require('../models/Event');
const User = require('../models/User');

describe('userHome function', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { email: 'test@example.com' },
            params: {}
        };
        res = {
            render: sinon.spy()
        };
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should render user home page with events and cities', async () => {
        const currentDate = new Date('2024-02-19');
        const events = [
            { date: new Date('2024-02-20'), completed: false, event_location: { city: 'New York' } },
            { date: new Date('2024-02-21'), completed: false, event_location: { city: 'Los Angeles' } }
        ];
        const cities = ['New York', 'Los Angeles'];
        const user = [{ name: 'Test User' }];

        sinon.stub(Date, 'now').returns(currentDate);
        sinon.stub(Event, 'find').resolves(events);
        sinon.stub(Event, 'distinct').resolves(cities);
        sinon.stub(User, 'find').resolves(user);

        await userHome(req, res, next);

        expect(res.render.calledOnce).to.be.true;
        expect(res.render.firstCall.args[0]).to.equal('user_home');
        expect(res.render.firstCall.args[1]).to.deep.equal({
            title: 'Events',
            events: events,
            cities: cities,
            user: user
        });
    });

//     it('should filter events by city if city parameter is provided', async () => {
//         req.params.city = 'New York';
//         const currentDate = new Date('2024-02-19');
//         const events = [
//             { date: new Date('2024-03-20'), completed: false, event_location: { city: 'New York' } },
//             { date: new Date('2024-03-21'), completed: false, event_location: { city: 'Los Angeles' } }
//         ];
//         const user = [{ name: 'Test User' }];

//         sinon.stub(Date, 'now').returns(currentDate);
//         sinon.stub(Event, 'find').resolves(events);
//         sinon.stub(User, 'find').resolves(user);

//         await userHome(req, res, next);

//         expect(Event.find.calledOnce).to.be.true;
//         expect(Event.find.firstCall.args[0]).to.deep.equal({ 'event_location.city': 'New York', completed: false });
//     });

//     it('should fetch all events after current date if no city parameter is provided', async () => {
//         const currentDate = new Date('2024-02-19');
//         const events = [
//             { date: new Date('2024-03-20'), completed: false, event_location: { city: 'New York' } },
//             { date: new Date('2024-03-21'), completed: false, event_location: { city: 'Los Angeles' } }
//         ];
//         const user = [{ name: 'Test User' }];

//         sinon.stub(Date, 'now').returns(currentDate);
//         sinon.stub(Event, 'find').resolves(events);
//         sinon.stub(User, 'find').resolves(user);

//         await userHome(req, res, next);

//         expect(Event.find.calledOnce).to.be.true;
//         expect(Event.find.firstCall.args[0]).to.deep.equal({ completed: false });
//     });

 });
