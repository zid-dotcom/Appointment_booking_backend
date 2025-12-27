const mongoose=require('mongoose')




const doctorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,

    },
    image:{
        type:String,
        required:true
    },
    speciality:{
        type:String,
        required:true
    },
    degree:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true

    },
    about:{
        type:String,
        required:true

    },
    available:{
        type:Boolean,
        default:true
    },
    fees:{
        type:Number,
        required:true
    },
    address:{
        type:Object,
        required:true
        
    },
    date:{
        type:Number,
        required:true
    },
    slots_booked:{
        type:Object,
      
        default:{}
    }

},{minimize:false})  /* here we set minimise as false.  slots_booked: {}
MongoDB normally does NOT save this field because it’s an empty object.
But if you want to keep empty objects in the database, you use:  */

const doctorModel=mongoose.model('doctorModel',doctorSchema)

module.exports=doctorModel


