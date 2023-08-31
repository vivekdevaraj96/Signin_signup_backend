const validator=require('validator')

const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    fname:{type:String,required:true},
    lname:{type:String},
    email:{
        type:String,
        required:true,
        lowercase:true,
        validate:(value)=>{
            return validator.isEmail(value)
        }
    },
    password:{
        type:String,
        required:true
    },
    randomstring:{type:String}
},
{
    versionKey:false
})

const userModel=mongoose.model('users',userSchema)

module.exports={userModel}