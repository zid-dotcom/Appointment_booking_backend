const mongoose=require('mongoose')

const appointmentSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    docId:{
        type:String,
        required:true
    },
    slotTime:{
        type:String,
        required:true

    },
    userData:{
        type:Object,
        required:true

    },
    docData:{
        type:Object,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    cancelled:{
        type:Boolean,
        required:true,
        default:false

    },
    payment:{
        type:Boolean,
        default:false
    },
     slotDate: {                    // ✅ ADD THIS
    type: String,
    required: true
  },
    isCompleted:{
        type:Boolean,
        default:false

    },
    
},{timestamps: true




})

const AppointmentModel=mongoose.model('AppointmentModel',appointmentSchema)
module.exports=AppointmentModel