const Admin = require("./Admin.js");

async function gettingAdminDetails(val){
    try{
        const adminDetails = await Admin.findOne({"admin_username":val});
        console.log(adminDetails);
        return adminDetails;
    }
    catch(e){
        console.log(e)
    }
}

module.exports = {gettingAdminDetails};