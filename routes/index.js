var express = require('express');
var router = express.Router();
const {userModel}=require('../schemas/userSchema');
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const {dburl}=require('../common/dbconfig')
mongoose.connect(dburl)
let jwt=require('jsonwebtoken')
var JWT_secret="hxfawbiufvimaboiga9wfewfpwefhrpohrawn90fh"
const nodemailer = require("nodemailer");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Welcome");
});

// signup API
router.post('/signup',async(req, res)=>{
    try {
        let {fname,lname, email, password}=req.body

        var encryptedPassword=await bcrypt.hash(password,10)

        let user= await userModel.findOne({email: email})
        if (!user) {
            await userModel.create({fname,lname,email,password:encryptedPassword})
            res.status(200).send({message: "Signup Successfull"})
        } else {
            res.status(400).send({message:"User already exists"})
        }
    } catch (error) {
        res.status(400).send({message:error})
    }
})

router.post('/signin',async(req,res)=>{
  try {
    const {email,password}=req.body

    const user=await userModel.findOne({email});

    if(user){
      if(await bcrypt.compare(password,user.password)){
        const token=jwt.sign({email:user.email},JWT_secret)
        res.status(200).json({message:"login Successfull", data: token, status:"ok"})
      }else{
        res.status(400).send({message:"Invalid Password"})
      }
    }else{
      res.status(400).send({message:"User Doesn't Exists"})
    }
  } catch (error) {
    res.status(400).send({message:error})
  }
})

router.post('/userData',async(req,res)=>{
  try {
    const {token}=req.body;
    const user=jwt.verify(token, JWT_secret);



      const useremail=user.email;
      userModel.findOne({email:useremail})
      .then((data)=>{
        res.send({status:200, data:data})
      }).catch((error)=>{
        res.send({status:400, data:error})
        console.log(fname)
      })

  } catch (error) {
    res.status(400).send({message:error})
  }
})

router.post('/forgetpassword',async(req,res)=>{
  try {
    const {email}=req.body;
    const olduser=await userModel.findOne({email});
    if(!olduser){
      return res.json({message:"user Doesn't exists"})
    }
    let randomstring=await bcrypt.genSalt(10)
    const secret=JWT_secret+olduser.password;
    olduser.randomstring=randomstring;
    olduser.save()
    const token=await jwt.sign({email:olduser.email,id:olduser.id,randomstring:randomstring}, secret, {
      expiresIn:"5m"
    })
    const link=`https://signin-signup-backend-cpk7.onrender.com/secretkey/${olduser.id}/${token}`
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vivekdevaraj603@gmail.com',
        pass: 'dwnqccjpguxbiskw'
      }
    });
    
    var mailOptions = {
      from: 'vivekdevaraj603@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: link
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    console.log(link)
    res.status(200).send({message:"link send to mail",id:olduser.id,key:token})

  } catch (error) {
    res.status(400).send({message:error})
  }
})

router.get('/secretkey/:id/:token',async(req,res)=>{
  const {id,token}=req.params;
  try {
    let data=jwt.decode(token)
    console.log(`data .....${data}`)
    res.status(200).send(`secret key =      ${data.randomstring}`)
  } catch (error) {
    res.status(400).send({message:error})
  }
})

router.post('/reset-password/:id/:token',async(req,res)=>{
  const {id,token}=req.params;
  const {password, secretkey}=req.body;
  try {
    console.log(id)
    let data=jwt.decode(token)
    console.log(`data .....${data}`)
   
    const olduser=await userModel.findOne({_id:id});
    if(olduser){
      if (olduser.randomstring==secretkey) {
        var encryptedPassword=await bcrypt.hash(password,10)
        olduser.password=encryptedPassword;
        olduser.save();
        res.status(200).send({message:"Password Changed",status:"ok", data})
      } else {
        res.status(400).send({message:"error in random string", data})
      }     
    }else{
      res.status(400).send({message:"Unable to retrieve user data"})
    }
  } catch (error) {
    res.status(400).send({message:error})
  }
})

module.exports = router;