const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');

const adminActionController = require('../controllers/adminActionController');
const Admin = require('../models/Admin');
const Event = require('../models/Event');
//const uploadFileToS3 = require('../services/uploadToS3');

describe('adminActionController', () => {

    let adminFindStub;
    let eventFindStub;

    beforeEach(() => {
        adminFindStub = sinon.stub(Admin, 'find');
        eventFindStub = sinon.stub(Event, 'find');
        eventAggregateStub = sinon.stub(Event, 'aggregate');
    });

    afterEach(() => {
        // adminFindStub.restore();
        // eventFindStub.restore();
        sinon.restore();
    });

    describe('adminDashboard', () => {

        it('should render admin dashboard', async () => {
            const req = {
                user: { username: 'testadmin' }
            };
            const res = {
                render: sinon.spy()
            };

           
            adminFindStub.resolves([{ username: 'testadmin', _id: '123' }]);
            eventFindStub.resolves([{ postedBy: '123' }]);
            eventAggregateStub.resolves([{ _id: 'Event 1', totalTicketsSold: 10 }]);

            await adminActionController.adminDashboard(req, res);

            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('admin_dashboard');
        });

    });

    describe('postEvent', () => {

        it('should render post event page', async () => {
            const req = {};
            const res = {
                render: sinon.spy()
            };

            await adminActionController.postEvent(req, res);

            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('post_event');
        });

    });

    // describe('newEvent', () => {

    //     it('should create and save new event', async () => {
    //         const req = {
    //             body: {
    //                 event_name: 'Test Event',
    //                 venue: 'Test Venue',area: 'Test Area',
    //                 city: 'Test City',
    //                 host: 'Test Host',
    //                 time: 'Test Time',
    //                 date: 'Test Date',
    //                 description: 'Test Description',
    //                 no_of_tickets: 100,
    //                 ticketPrice: 10
    //             },
    //             file: {
    //                 filename: 'test.jpg'
    //             },
    //             user: {
    //                 username: 'testadmin'
    //             }
    //         };
    //         const res = {
    //             render: sinon.spy(),
    //             status: sinon.stub().returns({ json: sinon.spy() })
    //         };

    //         adminFindStub.resolves([{ admin_username: 'testadmin', _id: '123', eventsPosted: [], save: sinon.stub() }]);
            
    //         eventFindStub.resolves([{ postedBy: '123' }]);
    //         //sinon.stub(uploadFileToS3('test-bucket', req.file.filename)).resolves('https://test.s3.url');
    //         //sinon.stub(uploadFileToS3).callsFake(() => Promise.resolve('https://test.s3.url'));

    //         await adminActionController.newEvent(req, res);
           
    //         expect(res.render.calledOnce).to.be.true;
    //         sinon.restore();
    //     });

    // });

    describe('adminEvents', () => {

        it('should fetch and render admin events page', async () => {
            const req = {
                params: {
                    adminId: '123'
                }
            };
            const res = {
                render: sinon.spy()
            };

            // sinon.stub(Admin, 'find').resolves([{ _id: '123' }]);
            // sinon.stub(Event, 'find').resolves([{ name: 'Event 1' }]);

            adminFindStub.resolves([{ _id: '123' }]);
            eventFindStub.resolves([{ name: 'Event 1' }]);

            await adminActionController.adminEvents(req, res);

            // expect(Admin.find.calledOnce).to.be.true;
            // expect(Event.find.calledOnce).to.be.true;
            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('adminEvents');
        });

    });



    describe('settings', () => {

        it('should render admin settings page', async () => {
            const req = {
                params: {
                    adminId: '123'
                }
            };
            const res = {
                render: sinon.spy()
            };

            adminFindStub.resolves([{_id: '123' }]);
           
            await adminActionController.settings(req, res);

            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('adminSettings');
        });

    })

    describe('updateProfile', () => {
        it('should update profile successfully', async () => {
            const req = {
                params: { adminId: 'admin123' },
                body: {
                    currentPassword: 'current123',
                    newPassword: 'new123',
                    confirmPassword: 'new123'
                },
                user: { username: 'testadmin' }
            };
            const res = {
                json: sinon.spy()
            };
    
            adminFindStub.resolves([{ _id: 'admin123', password: await bcrypt.hash('current123', 10), save: sinon.stub() }]);
            const bcryptCompareStub = sinon.stub(bcrypt, 'compare').resolves(true);
            const bcryptHashStub = sinon.stub(bcrypt, 'hash').resolves(await bcrypt.hash('new123', 10));
            
    
            await adminActionController.updateProfile(req, res);
    
            
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.calledWith({ result: 'success', msg: 'Profile updated successfully' })).to.be.true;
    
            bcryptCompareStub.restore();
            bcryptHashStub.restore();
        });
    });

    describe('cityChart', () => {
        it('should render admin city chart page with aggregated data', async () => {
            const req = {
                user: { username: 'testadmin' }
            };
            const res = {
                render: sinon.spy()
            };
    
            adminFindStub.resolves([{ admin_username: 'testadmin' }]);
            eventAggregateStub.resolves([
                { _id: 'City 1', totalEvents: 10 },
                { _id: 'City 2', totalEvents: 15 }
            ]);
    
            await adminActionController.cityChart(req, res);
    
            expect(adminFindStub.calledOnceWith({ admin_username: 'testadmin' })).to.be.true;
            expect(eventAggregateStub.calledOnceWith([
                { $group: { _id: '$event_location.city', totalEvents: { $sum: 1 } } }
            ])).to.be.true;
            expect(res.render.calledOnceWith('adminCityChart', {
                labels: ['City 1', 'City 2'],
                data: [10, 15],
                admin: [{ admin_username: 'testadmin' }]
            })).to.be.true;
    
            
        });
    });


});