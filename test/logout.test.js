const { expect } = require('chai');
const sinon = require('sinon');

const { logout } = require('../controllers/userLoginController');

describe('Logout Controller', () => {
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
    await logout(req, res, next);

    expect(res.clearCookie.calledOnce).to.be.true;
    expect(res.clearCookie.calledWith('jwt')).to.be.true;

    expect(res.redirect.calledOnce).to.be.true;
    expect(res.redirect.calledWith('/')).to.be.true;

    expect(next.called).to.be.false;
  });

  it('should not call next if no error occurs', async () => {
    await logout(req, res, next);

    expect(next.called).to.be.false;
  });

});
