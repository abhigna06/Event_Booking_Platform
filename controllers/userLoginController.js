var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/User');
var alert = require('alert'); 
var Event = require('../models/Event');
const session = require('express-session');

router.use(express.static("./public"));

const { check, validationResult } = require('express-validator');
const { gettingUserDetails } = require('../models/userLoginModels');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4:uuidv4 } = require('uuid');

const verifyToken = require('../middlewares/tokenVerification');


const cookieMaxAge = 300000000;
const jwtSecret = "keyboard cat"; 

router.use(cookieParser())


const createToken = (email) => {
  const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour
  return token;
};



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

async function register(req, res, next){
  
    try{
      res.render('register');
    }
    catch(e){
      console.log(e)
    }
}

async function login(req, res, next){
   
  try{
    res.render('login');
  }
  catch(e){
    console.log(e)
  }
}



async function validate(req, res, next){
try{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const alertError = errors.array()
    res.json({
      alertError:alertError
    });
  }
  else{
    const  result1 = await gettingUserDetails(req.body.email)
    if(result1==null){
      res.json({
        result: 'user-not-found', msg:'User Does not Exists, Please Register'
      })
    }
    else{
      const pw = await bcrypt.compare(req.body.password,result1.password);
      if(pw){

        const token=createToken(req.body.email);
        res.cookie('jwt',token,{maxAge: cookieMaxAge, httpOnly:true});

        res.json({
          result: 'redirect', url:'/users/user_home'
        })
      }
      else{
        res.json({
          result: 'password-wrong', msg:'Enter Correct Password'
        })
      }
    }
  }
}
catch(e){
  console.log(e)
}
}

async function newuser (req, res, next){
console.log(req.body);
console.log("entered signup");
  const { name, email, password, password1 } = req.body;

  console.log(req.body);

  
  const existingEmail = await User.find({email : email});
  if(existingEmail.length!==0){
    res.json({
      result:'existing user', msg:'User with this email id already exists. Try to login'
    })
  }
  
  else if(password1 !== password){
    res.json({
      result: 'passwords doesnot match', msg:'Enter Correct Password'
    })
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
      const user = new User({ name, email, password: hashedPassword });
      const savedUser = await user.save();

      if (!savedUser) {
          return res.status(500).json({ message: 'Unexpected Error Occurred' });
      }

      res.json({
        result: 'redirect', url:'/users/login'
      })
     // res.render('login');
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Unexpected Error Occurred' });
  }
}

async function logout (req, res, next) {
  try {
    res.clearCookie('jwt');
    res.redirect('/');
  } catch (e) {
    console.log(e)
  }
}



module.exports = { register, login, validate, newuser, logout};
