const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User'); // Assuming this is the User model
const bcrypt = require('bcryptjs'); // Assuming you're using bcrypt for password hashing
const userLoginController = require('../controllers/userLoginController');

describe('User Login Controller - New User', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        password1: 'password'
      }
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

  it('should create a new user successfully', async () => {
    // Mocking User.find to return empty array, simulating user does not exist
    sinon.stub(User, 'find').resolves([]);

    // Mocking bcrypt.hashSync to return hashed password
    sinon.stub(bcrypt, 'hashSync').returns('hashedPassword');

    // Mocking User.save to return saved user
    sinon.stub(User.prototype, 'save').resolves({ _id: 'user_id' });

    await userLoginController.newuser(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith({ result: 'redirect', url: '/users/login' })).to.be.true;
  });

//   it('should return "existing user" if user with same email exists', async function() {
//    // sinon.stub(User, 'find').resolves([{ email: 'test@example.com' , save: sinon.stub()}]);
//     // Mocking User.find to return array with one item, simulating user exists
//     sinon.stub(User, 'find').resolves([{ email: 'test@example.com' }]);
//     req.body.email = 'test@example.com';
//     await userLoginController.newuser(req, res, next);

//     expect(res.json.calledOnce).to.be.true;
//     expect(res.json.calledWithMatch({ result: 'existing user', msg:'User with this email id already exists. Try to login' })).to.be.true;
//   });

//   it('should return "passwords does not match" if passwords do not match', async () => {
    
//     req.body.password1 = 'differentpassword';

//     await userLoginController.newuser(req, res, next);

//     expect(res.json.calledOnce).to.be.true;
//     expect(res.json.calledWithMatch({ result: 'passwords doesnot match', msg:'Enter Correct Password' })).to.be.true;
//   })

});
