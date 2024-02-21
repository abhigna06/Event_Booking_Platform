const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Event = require('../models/Event');
const Admin = require('../models/Admin');

describe('Admin Schema', () => {
    let saveStub;

    before(() => {
        saveStub = sinon.stub(Event.prototype, 'save');
    });

    after(() => {
        saveStub.restore();
    });

   

    it('should throw an error if required fields are missing', async () => {
        const admin = new Admin({
            // Missing required fields
        });

       
        let error;
        try {
            await admin.save();
        } catch (err) {
            error = err;
        }
        console.log('Error:', error);
        
        expect(error).to.exist;
        expect(error).to.be.an('Error');
        expect(error.name).to.equal('ValidationError');
    });
});
