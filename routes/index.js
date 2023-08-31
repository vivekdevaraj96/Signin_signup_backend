var express = require('express');
var router = express.Router();
const {userModel}=require('../schemas/userSchema');
const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const {dburl}=require('../common/dbconfig')
mongoose.connect(dburl)
let jwt=require('jsonwebtoken')
var JWT_secret="hxfawbiufvimaboiga9wfewfpwefhrpohrawn90fh"


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Welcome");
});

// signup API
router.post('/signup',async(req, res)=>{
    try {
        let {fname,lname, email, password}=req.body

        let encryptedPassword=await bcrypt.hash(password,10)

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
    let randomstring=bcrypt.genSalt(10)
    const secret=JWT_secret+olduser.password;
    olduser.randomstring=randomstring;
    olduser.save()
    const token=jwt.sign({email:olduser.email,id:olduser.id,randomstring:randomstring}, secret, {
      expiresIn:"5m"
    })
    const link=`http://localhost:8000/reset-password/${olduser.id}/${token}`
    console.log(link)
    res.status(200).send({message:"link send to mail"})

  } catch (error) {
    res.status(400).send({message:error})
  }
})

router.post('/reset-password/:id/:token',async(req,res)=>{
  const {id,token}=req.params;
  try {
    
    
    
    console.log(`id...... ${id}`)
    console.log(`token ......${token}`)
    
    const olduser=await userModel.findOne({_id:id});
    console.log(olduser)
    if(olduser){
    const secret=JWT_SECRET+olduser.password;
    const verify=await jwt.verify(token,secret);
      console.log(verify)
      res.send(verify)
    }else{
      res.status(400).send({message:"Unable to retrieve user data"})
    }
  } catch (error) {
    res.status(400).send({message:error})
  }
})

module.exports = router;