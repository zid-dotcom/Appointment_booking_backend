const doctorModel = require('../models/doctormodel')
const validator = require('validator')
const bcrypt = require('bcrypt')
const { json } = require('express')
const jwt = require('jsonwebtoken')
const AppointmentModel = require('../models/appointmentModel')
const cloudinary = require('cloudinary').v2
const userModel=require('../models/usermodel')





// API  for adding doctor  by admin
exports.addDoctor = async (req, res) => {


    try {



        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body


        const imageFile = req.file

        //    console.log({ name, email, password, speciality, degree,experience,  about, fees,address},imageFile);
        // checking for all data to add doctor

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(404).json('please fill all fields ')
        }



        // validating email format

        if (!validator.isEmail(email)) {


            return res.status(406).json('please enter a valid email')






        }

        // validating strong password

        if (password.length < 8) {
            return res.status(401).json('password must be minimum 8 characters')

        }


        // hashing doctors password
        const salt = await bcrypt.genSalt(10)
        // console.log(salt);
        const hashedpassword = await bcrypt.hash(password, salt)
        // console.log(hashedpassword); 




        // upload image to cloudinary

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageURL = imageUpload.secure_url
        // console.log(imageURL);



        const doctorData = {

            name,
            email,
            image: imageURL,
            speciality,
            degree,
            experience,
            password: hashedpassword,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()


        }



        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        console.log(newDoctor);
        res.status(201).json('doctor uploaded successfully')







    }

    catch (err) {
        console.log(err);
        res.status(401).json(err)


    }
}

// Api for getting all doctors

exports.getAlldoctors = async (req, res) => {
    try {
        const listdoctors = await doctorModel.find().select('-password')
        res.status(200).json(listdoctors)

    }
    catch (err) {
        console.log(err);
        res.status(406).json(err)

    }

}








// APi for admin login 

exports.loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.status(201).json({ success: true, token })



        }
        else {
            res.status(401).json({ success: false, message: 'invalid credentials' })


        }








    }
    catch (err) {
        console.log(err);
        res.status(401).json(err)

    }
}




exports.ChangeAvailabilityStatus = async (req, res) => {
    try {
        const { id } = req.params
        const docData = await doctorModel.findById(id)
        console.log(docData);

        await doctorModel.findByIdAndUpdate(id, { available: !docData.available })
        res.json("Availability changed");

    }
    catch (err) {
        console.log(err);
        res.status(406).json(err)

    }

}




// Api to get all appointment list

exports.GetAllappointments = async (req, res) => {
    try {
        const AppointmentData = await AppointmentModel.find()
        res.status(200).json(AppointmentData)


    }
    catch (err) {
        console.log(err);
        res.status(406).json({ success: false, message: 'failed to load AppointmentData!' })


    }

}


// Api for cancel appointment by admin



exports.CancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body

        // find Appointment

        const appointment = await AppointmentModel.findById(appointmentId)


        // prevent doubdle cancellation

        if (appointment.cancelled) {
            return res.status(500).json('Apointment already cancelled')
        }

        appointment.cancelled = true,
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
        console.log(err);
        res.status(406).json({ success: false, message: 'failed to cancel' })


    }
}



// Api to get dashboard data for admin panel



exports.adminDashboard=async(req,res)=>{
    try{
        const doctors= await doctorModel.find()
        const users= await userModel.find()
        const appointments=await AppointmentModel.find()


        const dashData={
            doctors:doctors.length,
            appointments:appointments.length,
            patients:users.length,
            latestAppointments:appointments.reverse().slice(0,5)


        }
        res.status(200).json(dashData)

    }
    catch(err){
        console.log(err);
        res.status(406).json(err)
        
    }

}


