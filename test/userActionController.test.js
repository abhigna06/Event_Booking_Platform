const { expect } = require('chai');
const sinon = require('sinon');
const userActionController = require('../controllers/userActionController');
const Event = require('../models/Event');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


describe('userActionController', () => {

    describe('userHome ', () => {
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
    
            await userActionController.userHome(req, res, next);
    
            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('user_home');
            expect(res.render.firstCall.args[1]).to.deep.equal({
                title: 'Events',
                events: events,
                cities: cities,
                user: user
            });
        });
    
        // it('should filter events by city if city parameter is provided', async () => {
        //     req.params.city = 'New York';
        //     const currentDate = new Date('2024-02-19');
        //     const events = [
        //         { date: new Date('2024-03-20'), completed: false, event_location: { city: 'New York' } },
        //         { date: new Date('2024-03-21'), completed: false, event_location: { city: 'Los Angeles' } }
        //     ];
        //     const user = [{ name: 'Test User' }];
    
        //     sinon.stub(Date, 'now').returns(currentDate);
        //     sinon.stub(Event, 'find').resolves(events);
        //     sinon.stub(User, 'find').resolves(user);
    
        //     await userActionController.userHome(req, res, next);
    
        //     expect(Event.find.calledOnce).to.be.true;
        //     expect(Event.find.firstCall.args[0]).to.deep.equal({ 'event_location.city': 'New York', completed: false });
        // });
    
        // it('should fetch all events after current date if no city parameter is provided', async () => {
        //     const currentDate = new Date('2024-02-19');
        //     const events = [
        //         { date: new Date('2024-03-20'), completed: false, event_location: { city: 'New York' } },
        //         { date: new Date('2024-03-21'), completed: false, event_location: { city: 'Los Angeles' } }
        //     ];
        //     const user = [{ name: 'Test User' }];
    
        //     sinon.stub(Date, 'now').returns(currentDate);
        //     sinon.stub(Event, 'find').resolves(events);
        //     sinon.stub(User, 'find').resolves(user);
    
        //     await userActionController.userHome(req, res, next);
    
        //     expect(Event.find.calledOnce).to.be.true;
        //     expect(Event.find.firstCall.args[0]).to.deep.equal({ completed: false });
        // });
    
    });

    describe('Search Events', () => {
        afterEach(() => {
            sinon.restore();
        });
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
          await userActionController.searchEvents(req, res, Event);
      
          // Verify that res.json is called with the dummy events
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.calledWith(dummyEvents)).to.be.true;
      
          eventAggregateStub.restore();
        });
    });

    describe('Event Details', () => {

        afterEach(() => {
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
            await userActionController.eventDetails(req, res, next);
    
            // Check if Event.find() is called with the correct eventId
            expect(Event.find.calledOnceWithExactly({ _id: 'event_id' })).to.be.true;
    
            // Check if the render method is called with the correct view and data
            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('eventDetails');
            expect(res.render.firstCall.args[1]).to.deep.equal({ event: [mockEvent] });
    
            // Ensure that status and send methods are not called
            expect(res.status.called).to.be.false;
            expect(res.send.called).to.be.false;

            Event.find.restore();
            
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

    describe('Book Tickets', () => {
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


    // describe('User Bookings', () => {

    //     afterEach(() => {
    //         sinon.restore();
    //     })
         
    //     it('should render the user bookings view', async () => {
    //         const req = {
    //             params: { userId: 'user_id' },
    //         };
    //         const res = {
    //             render: sinon.spy()
    //         };
    //         sinon.stub(User, 'find').resolves([{ bookings: [{ eventId: 'eventId123', ticketsCount: 2 }] }]);

    //         await userActionController.userBookings(req, res);
    //         expect(res.render.calledOnce).to.be.true;
    //         expect(res.render.firstCall.args[0]).to.equal('userBookings');
    //         expect(res.render.firstCall.args[1].user).to.deep.equal([{ bookings: [{ eventId: 'eventId123', ticketsCount: 2 }] }]);
           
    //         User.find.restore();
    //     });
    // });

    describe('Cancel Booking', () => {
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
          
          
         // expect(res.json.calledOnceWithExactly({ result: 'success', message:'Booking Cancelled Successfully'})).to.be.true;
         
          
        });
      
        it('should handle errors', async () => {
          sinon.stub(User, 'find').rejects(new Error('Test error'));
      
          await userActionController.cancelBooking(req, res, next);
      
          expect(res.json.calledWith({ result: 'failure', message: 'Booking Cancellation Failed' })).to.be.true;
         
        });
    });


    describe('settings', () => {
        it('should render user settings page with user data', async () => {
            const req = {
                params: { userId: 'user_id' }
            };
            const res = {
                render: sinon.spy()
            };
            const user = [{ name: 'test user' }];
            sinon.stub(User, 'find').resolves(user);

            await userActionController.settings(req, res, sinon.spy());
            
            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('userSettings');
            expect(res.render.firstCall.args[1].user).to.deep.equal([{ name: 'test user' }]);
            
            User.find.restore();
        });

    });

    describe('Update Profile', () => {
        let req, res, next;
      
        beforeEach(() => {
          req = {
            user: { email: 'test@example.com' },
            body: {
              name: 'New Name',
              currentPassword: 'current_password',
              newPassword: 'new_password',
              confirmPassword: 'new_password'
            }
          };
          res = {
            json: sinon.spy()
          };
          next = sinon.spy();
        });
      
        afterEach(() => {
          sinon.restore();
        });
      
        it('should update profile successfully with name and password change', async () => {
          const user = { email: 'test@example.com', password: await bcrypt.hash('current_password', 10), save: sinon.stub().resolves({}) };
          sinon.stub(User, 'find').resolves([user]);
          sinon.stub(bcrypt, 'compare').resolves(true);
          sinon.stub(bcrypt, 'hash').resolves(await bcrypt.hash('new_password', 10));
          //sinon.stub(user, 'save').resolves(user);
      
          await userActionController.updateProfile(req, res, next);
      
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.calledWith({ result: 'success', msg: 'Profile updated successfully' })).to.be.true;
        });
      
        it('should handle wrong current password', async () => {
          const user = { email: 'test@example.com', password: await bcrypt.hash('other_password', 10) };
          sinon.stub(User, 'find').resolves([user]);
          //sinon.stub(bcrypt, 'compare').resolves(false);
      
          await userActionController.updateProfile(req, res, next);
      
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.calledWith({ result: 'wrong-password', msg: 'Enter Correct Current Password' })).to.be.true;
        });
      
        it('should handle passwords not matching', async () => {
          const user = { email: 'test@example.com', password: await bcrypt.hash('current_password', 10) };
          sinon.stub(User, 'find').resolves([user]);
          //sinon.stub(bcrypt, 'compare').resolves(true);
      
          req.body.confirmPassword = 'different_password';
      
          await userActionController.updateProfile(req, res, next);
      
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.calledWith({ result: 'passwords-doesnot-match', msg: 'New password and current password doesnot match' })).to.be.true;
        });
    });
      
})