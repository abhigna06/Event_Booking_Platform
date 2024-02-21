const { expect } = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');
const userController = rewire('../controllers/userLoginController');

describe('Login Controller', () => {
    it('should render the login view', async () => {
       
        const res = {
            render: sinon.spy() // Spy on the render method
        };

        const req = {};

        const next = sinon.spy();

        // Call the login function
        await userController.login(req, res, next);

        expect(res.render.calledOnce).to.be.true;
        expect(res.render.firstCall.args[0]).to.equal('login');

        expect(next.called).to.be.false;
    });

   
});


describe('User Login Controller - Validate', () => {
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
    
    const gettingUserDetailsStub = sinon.stub().resolves(null);
    userController.__set__('gettingUserDetails', gettingUserDetailsStub);

    await userController.validate(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ result: 'user-not-found' })).to.be.true;
  });

  it('should return password-wrong if password is incorrect', async () => {
   
    const gettingUserDetailsStub = sinon.stub().resolves({ email: 'test@example.com', password: 'hashedpassword' });
    userController.__set__('gettingUserDetails', gettingUserDetailsStub);

    const bcryptCompareStub = sinon.stub().resolves(false);
    userController.__set__('bcrypt.compare', bcryptCompareStub);

    await userController.validate(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ result: 'password-wrong' })).to.be.true;
  });
});