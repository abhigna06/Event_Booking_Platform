const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/tokenVerification');

describe('Verify Token Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };
        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should pass with a valid token', () => {
        const token = jwt.sign({ userId: 'user_id' }, 'keyboard cat');
        req.cookies.jwt = token;

        verifyToken(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(req.user.userId).to.equal('user_id');
    });

    it('should return unauthorized with an invalid token', () => {
        const token = 'invalid_token';
        req.cookies.jwt = token;

        verifyToken(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: 'Unauthorized' })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should return unauthorized without a token', () => {
        verifyToken(req, res, next);

        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: 'Unauthorized' })).to.be.true;
        expect(next.called).to.be.false;
    });
});
