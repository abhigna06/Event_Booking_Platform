const { expect } = require('chai');
const sinon = require('sinon');
const Admin = require('../models/Admin');
const Event = require('../models/Event')
const mainAdminController = require('../controllers/mainAdminController');

describe('Admin Controller - Delete Admin', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: 'admin_id' },
      user: { username: 'main_admin' } // Simulating the user object
    };
    res = {
      status: sinon.stub().returnsThis(), // Stubbing the status method to return 'this' for chaining
      json: sinon.spy()
    };
  });

  afterEach(() => {
    sinon.restore();
  });

//   it('should not delete main admin', async () => {
//     // Stubbing Admin.find to resolve with main admin
//     sinon.stub(Admin, 'find').resolves([{ _id: 'main_admin_id' }]);

//     await mainAdminController.deleteAdmin(req, res);

//     // Assertions
//     expect(res.status.calledWith(400)).to.be.true;
//     expect(res.json.calledWith({ error: 'Cannot delete main admin' })).to.be.true;
//   });

  it('should delete admin successfully', async () => {
    // Stubbing Admin.find to resolve with admin other than main admin
    sinon.stub(Admin, 'find').resolves([{ _id: 'another_admin_id' }]);
    // Stubbing Admin.findByIdAndDelete to resolve successfully
    sinon.stub(Admin, 'findByIdAndDelete').resolves();

    await mainAdminController.deleteAdmin(req, res);

    // Assertions
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWith({ message: 'Admin deleted successfully' })).to.be.true;
  });

  it('should handle errors', async () => {
    // Stubbing Admin.find to reject with an error
    sinon.stub(Admin, 'find').rejects(new Error('Test error'));

    await mainAdminController.deleteAdmin(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({ error: 'Internal Server Error' })).to.be.true;
  });
});
