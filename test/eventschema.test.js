const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Event = require('../models/Event');
const Admin = require('../models/Admin');

describe('Event Schema', () => {
    let saveStub;

    before(() => {
        saveStub = sinon.stub(Admin.prototype, 'save');
    });

    after(() => {
        saveStub.restore();
    });

   

    it('should throw an error if required fields are missing', async () => {
        const event = new Event({
            // Missing required fields
        });

       
        let error;
        try {
            await event.save();
        } catch (err) {
            error = err;
        }

        
        expect(error).to.exist;
        expect(error).to.be.an('Error');
        expect(error.name).to.equal('ValidationError');
    });
});
