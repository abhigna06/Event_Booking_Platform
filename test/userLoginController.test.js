const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const rewire = require('rewire');
const userLoginController = rewire('../controllers/userLoginController');
const  { gettingUserDetails } = require('../models/userLoginModels')
describe('adminActionController', () => {


    describe('Register', () => {
        it('should render the register view', async () => {
        
            const res = {
                render: sinon.spy() 
            };
            const req = {};
            const next = sinon.spy();
    
            await userLoginController.register(req, res, next);
    
            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('register');
    
            expect(next.called).to.be.false;
        });
    });

    describe('Login ', () => {
        it('should render the login view', async () => {
        
            const res = {
                render: sinon.spy() // Spy on the render method
            };

            const req = {};

            const next = sinon.spy();

            // Call the login function
            await userLoginController.login(req, res, next);

            expect(res.render.calledOnce).to.be.true;
            expect(res.render.firstCall.args[0]).to.equal('login');

            expect(next.called).to.be.false;
        });
    });

    describe('Validate', () => {
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
          userLoginController.__set__('gettingUserDetails', gettingUserDetailsStub);
      
          await userLoginController.validate(req, res, next);
      
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.calledWithMatch({ result: 'user-not-found' })).to.be.true;
        });
      
        it('should return password-wrong if password is incorrect', async () => {
         
          const gettingUserDetailsStub = sinon.stub().resolves({ email: 'test@example.com', password: 'hashedpassword' });
          userLoginController.__set__('gettingUserDetails', gettingUserDetailsStub);
      
          const bcryptCompareStub = sinon.stub().resolves(false);
          userLoginController.__set__('bcrypt.compare', bcryptCompareStub);
      
          await userLoginController.validate(req, res, next);
      
          expect(res.json.calledOnce).to.be.true;
          expect(res.json.calledWithMatch({ result: 'password-wrong' })).to.be.true;
        });
      });


    describe(' New User', () => {
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
    });

    describe('Logout ', () => {
        let req, res, next;
      
        beforeEach(() => {
          req = {};
          res = {
            clearCookie: sinon.spy(),
            redirect: sinon.spy()
          };
          next = sinon.spy();
        });
      
        afterEach(() => {
          sinon.restore();
        });
      
        it('should clear JWT cookie and redirect to home page', async () => {
          await userLoginController.logout(req, res, next);
      
          expect(res.clearCookie.calledOnce).to.be.true;
          expect(res.clearCookie.calledWith('jwt')).to.be.true;
      
          expect(res.redirect.calledOnce).to.be.true;
          expect(res.redirect.calledWith('/')).to.be.true;
      
          expect(next.called).to.be.false;
        });
      
        it('should not call next if no error occurs', async () => {
          await userLoginController.logout(req, res, next);
      
          expect(next.called).to.be.false;
        });
      
    });
});

