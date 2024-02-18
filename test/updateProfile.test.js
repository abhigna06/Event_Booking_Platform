const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userActionController = require('../controllers/userActionController');

describe('Update Profile Function', () => {
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
    sinon.stub(bcrypt, 'compare').resolves(false);

    await userActionController.updateProfile(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith({ result: 'wrong-password', msg: 'Enter Correct Current Password' })).to.be.true;
  });

  it('should handle passwords not matching', async () => {
    const user = { email: 'test@example.com', password: await bcrypt.hash('current_password', 10) };
    sinon.stub(User, 'find').resolves([user]);
    sinon.stub(bcrypt, 'compare').resolves(true);

    req.body.confirmPassword = 'different_password';

    await userActionController.updateProfile(req, res, next);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.calledWith({ result: 'passwords-doesnot-match', msg: 'New password and current password doesnot match' })).to.be.true;
  });
});
