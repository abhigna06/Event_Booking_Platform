const sinon = require('sinon');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('POST /users/newuser', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should return 200 and redirect to login page for valid registration data', (done) => {
        const saveStub = sinon.stub(User.prototype, 'save').resolves({});

        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password',
            password1: 'password'
        };

        request(app)
            .post('/users/newuser')
            .send(userData)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.result).to.equal('redirect');
                expect(res.body.url).to.equal('/users/login');
                done();
            });
    });

    // it('should return an error if user with the same email already exists', (done) => {
    //     sinon.stub(User, 'find').resolves([{ email: 'existing@example.com' }]);

    //     const userData = {
    //         name: 'Test User',
    //         email: 'existing1@example.com',
    //         password: 'password',
    //         password1: 'password'
    //     };

    //     request(app)
    //         .post('/users/newuser')
    //         .send(userData)
    //         .expect(200)
    //         .end((err, res) => {
    //             if (err) return done(err);
    //             expect(res.body.result).to.equal('existing user');
    //             expect(res.body.msg).to.equal('User with this email id already exists. Try to login');
    //             done();
    //         });
    // });

    // it('should return an error if passwords do not match', (done) => {
    //     const userData = {
    //         name: 'Test User',
    //         email: 'test2@example.com',
    //         password: 'password',
    //         password1: 'differentpassword'
    //     };

    //     request(app)
    //         .post('/users/newuser')
    //         .send(userData)
    //         .expect(200)
    //         .end((err, res) => {
    //             if (err) return done(err);
    //             expect(res.body.result).to.equal('passwords doesnot match');
    //             expect(res.body.msg).to.equal('Enter Correct Password');
    //             done();
    //         });
    // });

    
});