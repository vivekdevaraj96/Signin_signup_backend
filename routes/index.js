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

module.exports = router;