const { expect } = require('chai');
const sinon = require('sinon');
const { gettingUserDetails } = require('../models/userLoginModels');
const User = require('../models/User')

describe('gettingUserDetails', () => {
    it('should return user details', async () => {
        // Define a mock user object
        const mockUser = {
            _id: 'user_id',
            name: 'John Doe',
            email: 'john@example.com',
            // Add other properties as needed
        };

        sinon.stub(User, 'findOne').resolves(mockUser);

        const userDetails = await gettingUserDetails('john@example.com');

        expect(userDetails).to.deep.equal(mockUser);

        sinon.restore();
    });

    it('should handle errors gracefully', async () => {
        // Stub the User.findOne() method to throw an error
        const errorMessage = 'Database error';
        sinon.stub(User, 'findOne').rejects(new Error(errorMessage));

        const userDetails = await gettingUserDetails('john@example.com');

        expect(userDetails).to.be.undefined;

        sinon.restore();
    });
});
