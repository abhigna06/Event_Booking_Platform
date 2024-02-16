const { expect } = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');
const userController = rewire('../controllers/userLoginController');

describe('User Controller - Validate', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'test123'
      }
    };
    res = {
      json: sinon.spy()
    };
    next = sinon.spy();
  });

  it('should return user-not-found if user does not exist', async () => {
    // Mocking gettingUserDetails to return null, simulating no user found
    const gettingUserDetailsStub = sinon.stub().resolves(null);
    userController.__set__('gettingUserDetails', gettingUserDetailsStub);

    // Calling the validate function
    await userController.validate(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ result: 'user-not-found' })).to.be.true;
  });

  it('should return password-wrong if password is incorrect', async () => {
    // Mocking gettingUserDetails to return a user object, simulating user found
    const gettingUserDetailsStub = sinon.stub().resolves({ email: 'test@example.com', password: 'hashedpassword' });
    userController.__set__('gettingUserDetails', gettingUserDetailsStub);

    // Mocking bcrypt.compare to return false, simulating wrong password
    const bcryptCompareStub = sinon.stub().resolves(false);
    userController.__set__('bcrypt.compare', bcryptCompareStub);

    // Calling the validate function
    await userController.validate(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ result: 'password-wrong' })).to.be.true;
  });
});
