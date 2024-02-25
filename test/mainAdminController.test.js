const { expect } = require('chai');
const sinon = require('sinon');
const adminFunctions = require('../controllers/mainAdminController');
const nodemailer = require('nodemailer');
const passwordGenerator = require('password-generator');
const Admin = require('../models/Admin');
const Event = require('../models/Event');

describe('Main Admin Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Stub req, res, and next functions
        req = {
            user: { username: 'main_admin_username' },
            body: {}, // Initialize empty body
            params: {} // Initialize empty params
        };
        res = {
            render: sinon.spy(),
            json: sinon.spy(),
            status: sinon.stub().returnsThis()
        };
        next = sinon.spy();

        // Stub nodemailer createTransport method
        sinon.stub(nodemailer, 'createTransport').returns({ sendMail: sinon.stub() });    
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('addAdmin', () => {
        it('should render add admin page',  () => {
            const res = {
                render: sinon.spy() 
            };

            adminFunctions.addAdmin(req, res, next);
            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('add_admin');
        });
    });

    describe('sendCredentials', () => {
        it('should send credentials to new admin', async () => {
            sinon.stub(Admin, 'find').resolves([]);
            sinon.stub(Admin.prototype, 'save').resolves();
            await adminFunctions.sendCredentials(req, res, next);
            expect(Admin.prototype.save.calledOnce).to.be.true;
            expect(res.json.calledOnceWithExactly({ result: 'success', msg: 'Admin credentials sent successfully' })).to.be.true;
        });

        it('should handle existing admin', async () => {
            sinon.stub(Admin, 'find').resolves([{ _id: 'existing_admin_id' }]);
            await adminFunctions.sendCredentials(req, res, next);
            expect(res.json.calledOnceWithExactly({ result: 'existing-admin', msg: 'Admin with this email id already exists' })).to.be.true;
        });
    });

    describe('manageAdmins', () => {
        it('should render manage admins page with data', async () => {
            sinon.stub(Admin, 'find').resolves([{ _id: 'admin_id' }]);
            sinon.stub(Event, 'find').resolves([{ postedBy: 'admin_id' }]);
            await adminFunctions.manageAdmins(req, res, next);
            expect(res.render.calledOnceWithExactly('manage_admins', { allAdmins: [{ _id: 'admin_id' }], admin: [{ _id: 'admin_id' }], events: [{ postedBy: 'admin_id' }] })).to.be.true;
        });
    });

    describe('deleteAdmin', () => {
        it('should delete admin and return success', async () => {
            const adminId = 'admin_id';
            sinon.stub(Admin, 'find').resolves([{ admin_username: 'main_admin_username', _id: 'main_admin_id' }]);
            sinon.stub(Admin, 'findByIdAndDelete').resolves();
            req.params.id = adminId;
            await adminFunctions.deleteAdmin(req, res);
            expect(Admin.findByIdAndDelete.calledOnceWithExactly(adminId)).to.be.true;
            expect(res.json.calledOnceWithExactly({ result: 'success', msg: 'Admin deleted successfully' })).to.be.true;
        });

        it('should handle deleting main admin', async () => {
            const adminId = 'main_admin_id';
            sinon.stub(Admin, 'find').resolves([{ admin_username: 'main_admin_username', _id: adminId }]);
            req.params.id = adminId;
            await adminFunctions.deleteAdmin(req, res);
            expect(res.status.calledOnceWithExactly(400)).to.be.true;
            expect(res.json.calledOnceWithExactly({ error: 'Cannot delete main admin' })).to.be.true;
        });
    });
});
