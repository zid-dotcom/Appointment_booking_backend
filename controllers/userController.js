const userModel = require('../models/usermodel')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { json } = require('express')
const doctorModel = require('../models/doctormodel')
const AppointmentModel = require('../models/appointmentModel')
const cloudinary = require('cloudinary').v2
const razorpay = require('razorpay')

  

 
  

// Api for user Login

exports.UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const existing = await userModel.findOne({ email} )
    console.log(existing);

    if (!existing) {
      return res.status(401).json("Invalid email ")



    }

    // compare password 
    const isMatch = await bcrypt.compare(password, existing.password)
    if (!isMatch) {
      return res.status(401).json("invalid  password")
    }

    // generate token
    const token = jwt.sign({ id: existing._id }, process.env.JWT_SECRET)
    res.status(201).json({ userName: existing.name, token })






  }
  catch (err) {
    console.log(err);
    res.status(406).json(err)

  }
}




// Api to register user register

exports.UserRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(406).json('please fill all fields')
    }



    // validating user Email

    if (!validator.isEmail(email)) {
      return res.status(406).json('please enter valid email')
    }


    // validating strong password


    if (password.length < 8) {
      return res.status(406).json('password  must be minimum 8 characters  ')




    }


    // checking existing user
    const exisitng = await userModel.findOne({ email })
    if (exisitng) {
      return res.status(406).json('user already exist try another Email!! ')
    }


    //  hashing password
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password, salt)





    const NewUser = new userModel({ name, email, password: hashedpassword })





    await NewUser.save()
    res.status(201).json(NewUser)



  }
  catch (err) {
    console.log(err);
    res.status(406).json(err)

  }
}


// Api for get user profile     here we getting user profile using   userId that we accessing from userAuth middleware


exports.getUserprofile = async (req, res) => {
  try {
    // const { userId } = req.body
    const userId = req.user.id
    const userData = await userModel.findById(userId).select('-password')
    res.status(200).json(userData)





  }
  catch (error) {
    console.log(error);
    res.status(406).json(error)

  }
}




// Api  for update userProfile   here we updating user profile using   userId that we accessing from userAuth middleware

exports.Updateprofile = async (req, res) => {

  try {
    const userId = req.user.id
    const { /*  userId */  name, address, gender, dob, phone } = req.body
    const imageFile = req.file

    if (!name || !address || !gender || !dob || !phone) {
      return res.status(406).json('please enter all fields ')

    }

    await userModel.findByIdAndUpdate(userId, { name, address: JSON.parse(address), dob, gender, phone })

    // upload image to clouidnary
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      const imageURL = imageUpload.secure_url

      await userModel.findByIdAndUpdate(userId, { image: imageURL })



    }
    res.status(201).json('Profile updated succesfully')





  }
  catch (err) {
    console.log(err);
    res.status(406).json(err)

  }






}




// Api to Book  appointment


// exports.BookAppointment = async (req, res) => {
//     try {
//         const { userId, docId, slotDate, slotTime } = req.body

//         const docData = await doctorModel.findById(docId).select('-password')
//         if (!docData.available) {
//             return res.status(406).json('Doctor not available')

//         }

//         let slots_Booked = docData.slots_booked

//         // checking slot availability
//         if (slots_Booked[slotDate]) {
//             if (slots_Booked[slotDate].includes(slotTime)) {
//                 return res.status(406).json('Slot not available')

//             } else {
//                 slots_Booked[slotDate].push(slotTime)

//             }


//         } else {
//             slots_Booked[slotDate] = []
//             slots_Booked[slotDate].push(slotTime)
//         }

//         const userData = await userModel.findById(userId).select('-password')
//         delete docData.slots_booked

//         const appointmentData={
//             userId,
//             docId,
//             docData,
//             userData,
//             amount:docData.fees,
//             slotDate,
//             slotTime,
//             date:Date.now()
//         }

//         const newAppointment=new AppointmentModel(appointmentData)
//         await newAppointment.save()

//         // save new slots Data in  docData
//         await doctorModel.findByIdAndUpdate(docId,{slots_booked})

//         res.status(201).json('Appointment Booked successfully')






//     }
//     catch (err) {
//         console.log(err);
//         res.status(406).json(err)

//     }
// }




// Api for getiing all doctors data to user





exports.listAllDoctors = async (req, res) => {
  try {
    const allDoctors = await doctorModel.find().select(['-email', '-password'])
    res.status(200).json(allDoctors)



  }
  catch (err) {
    console.log(err);

  }
}



// APi for booking appointment

exports.BookAppointment = async (req, res) => {
  try {
    const userId = req.user.id
    const { docId, slotDate, slotTime } = req.body

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json('Missing required fields')
    }

    const docData = await doctorModel.findById(docId).select('-password')
    if (!docData) {
      return res.status(404).json('Doctor not found')
    }

    if (!docData.available) {
      return res.status(409).json('Doctor not available')
    }

    const slots_Booked = { ...(docData.slots_booked || {}) }

    if (slots_Booked[slotDate]?.includes(slotTime)) {
      return res.status(409).json('Slot not available')
    }

    if (!slots_Booked[slotDate]) {
      slots_Booked[slotDate] = []
    }
    slots_Booked[slotDate].push(slotTime)

    const userData = await userModel.findById(userId).select('-password')

    const docObj = docData.toObject()
    delete docObj.slots_booked

    const appointmentData = {
      userId,
      docId,
      docData: docObj,
      userData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: Date.now(),
      status: 'booked'
    }

    const newAppointment = new AppointmentModel(appointmentData)
    await newAppointment.save()

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked: slots_Booked
    })

    res.status(201).json('Appointment booked successfully')

  } catch (err) {
    console.log(err)
    res.status(500).json('Server error')
  }
}




// Api to get users appointment 

exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id
    const appointments = await AppointmentModel.find( {userId} ).sort({ createdAt: -1 })
    res.status(200).json(appointments)



  }
  catch (err) {
    console.log(err);
    res.status(406).json(err)

  }
}





// APi to cancel  the appointment 


// exports.CancelAppointmentApi=async(req,res)=>{
//   try{
//     const userId=req.user.id
//     // const {appointmentId}=req.params
//     const {appointmentId}=req.body

//     // verifying appointmentId
//     if(!appointmentId){
//       return res.status(400).json('Appointment ID required')

//     }

//     // find Appointment 

//     const appointment=await AppointmentModel.findById(appointmentId)


//     // checking ownership

//     if(appointment.userId!==userId){
//       return res.status(401).json("Not authorized user")
//     }else{

//       await AppointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
//     }

//     // releasing doctorslot

//     const {docId,slotDate,slotTime}=appointment
//     let slots_booked=await doctorModel.findById(docId)
//     slots_booked= docData.slots_Booked
//     slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)

//     await doctorModel.findByIdAndUpdate(docId,{slots_booked})

//     res.status(200).json('Appointment cancelled')







//   }
//   catch(err){
//     console.log(err);
//     res.status(406).json(err)


//   }
// }







exports.CancelAppointmentApi = async (req, res) => {
  try {
    const userId = req.user.id
    const { appointmentId } = req.body

    if (!appointmentId) {
      return res.status(400).json("Appointment ID required")
    }
    


    // 1️⃣ Find appointment
    const appointment = await AppointmentModel.findById(appointmentId)

    if (!appointment) {
      return res.status(404).json("Appointment not found")
    }

    // 2️⃣ Check ownership (ObjectId → string)
    if (appointment.userId.toString() !== userId) {
      return res.status(401).json("Not authorized user")
    }

    // 3️⃣ Prevent double cancellation
    if (appointment.cancelled) {
      return res.status(400).json("Appointment already cancelled")
    }

    // 4️⃣ Cancel appointment
    appointment.cancelled = true
    await appointment.save()

    // 5️⃣ Release doctor slot
    const doctor = await doctorModel.findById(appointment.docId)

    if (doctor?.slots_booked?.[appointment.slotDate]) {
      doctor.slots_booked[appointment.slotDate] =
        doctor.slots_booked[appointment.slotDate].filter(
          time => time !== appointment.slotTime
        )

      // remove empty date key
      if (doctor.slots_booked[appointment.slotDate].length === 0) {
        delete doctor.slots_booked[appointment.slotDate]
      }

      await doctor.save()
    }

    return res.status(200).json("Appointment cancelled successfully")
  }
  catch (err) {
    console.log(err)
    res.status(500).json("Server error")
  }
}



// Api to make payment of appointment using razorpay


const RazorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})


exports.payementRazerpay = async (req, res) => {
  try {
    const userId = req.user.id
    const { appointmentId } = req.body
    const appointmentData = await AppointmentModel.findById(appointmentId)

    console.log(appointmentData);

    // if there is no appointment data with that id or if appointment cancelled we are  not creating payment 

    if (!appointmentData || appointmentData.cancelled) {
      return res.status(401).json('appointment cancelled or not found')



    }

    // checking ownership

    if (appointmentData.userId !== userId) {
      return res.status(401).json('Not authorized')
    }


    if (appointmentData.payment) {
      return res.status(401).json('Payment already  completed ')
    }






    // creating options for razorpayment

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId

    }


    // creation of an order


    const order = await RazorpayInstance.orders.create(options)
    res.status(200).json({ success: true, order })









  }


  catch (err) {
    console.log(err);
    res.status(406).json(err)

  }



}



// Api for  verify payment of razorpay





exports.verifyRazorpay = async (req, res) => {
  try {
    // here razopay_order_id we get as a response from front end after creating order
    const { razorpay_order_id } = req.body

    const orderInfo = await RazorpayInstance.orders.fetch(razorpay_order_id)
    console.log(orderInfo);

    if (orderInfo.status == 'paid') {
      await AppointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
      res.status(200).json({ success: true, orderInfo, message: "payment successfull" })



    }
    else {
      res.status(200).json({ success: false, message: "payment failed" })

    }




  }
  catch (err) {
    console.log(err);
    res.status(406).json(err)

  }


}














