const { expect } = require('chai');
const sinon = require('sinon');
const { gettingAdminDetails } = require('../models/adminLoginModels');
const Admin = require('../models/Admin')

describe('gettingAdminDetails', () => {
    it('should return user details', async () => {
       
        const mockAdmin = {
            _id: 'user_id',
            admin_username: 'John Doe',
            admin_email: 'john@example.com',
        };

        sinon.stub(Admin, 'findOne').resolves(mockAdmin);

        const adminDetails = await gettingAdminDetails('john@example.com');

        expect(adminDetails).to.deep.equal(mockAdmin);

        sinon.restore();
    });

    it('should handle errors gracefully', async () => {
        // Stub the User.findOne() method to throw an error
        const errorMessage = 'Database error';
        sinon.stub(Admin, 'findOne').rejects(new Error(errorMessage));

        const adminDetails = await gettingAdminDetails('john@example.com');

        expect(adminDetails).to.be.undefined;

        sinon.restore();
    });
});
