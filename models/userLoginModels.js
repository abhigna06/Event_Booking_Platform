const User = require('./User.js');

async function gettingUserDetails(val){
    try{
        const userDetails = await User.findOne({"email":val});
        console.log(userDetails);
        return userDetails;
    }
    catch(e){
        console.log(e)
    }
}

module.exports = {
    gettingUserDetails
}