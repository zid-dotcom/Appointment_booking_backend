const doctorModel = require('../models/doctormodel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AppointmentModel = require('../models/appointmentModel')
const cloudinary=require('cloudinary').v2






// Api for doctor Login 

exports.LoginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const existing = await doctorModel.findOne({ email })
        console.log(existing);

        if (!existing) {
            return res.status(401).json('Invalid email or password')
        }

        const isMatch = await bcrypt.compare(password, existing.password)

        if (isMatch) {
            const token = jwt.sign({ id: existing._id }, process.env.JWT_SECRET)
            res.status(201).json({ username: existing.name, token })


        }
        else {
            res.status(406).json('Invalid credentails')


        }



    }
    catch (err) {
        console.log(err);
        res.status(406).json(err)

    }

}





// Api to get doctor appointments for doctor panel


exports.appointmentsDoctor = async (req, res) => {
    try {

        // const {docId}=req.body
        const docId = req.doctor.id
        const doctorAppointments = await AppointmentModel.find({ docId })

        res.status(200).json(doctorAppointments)







    }
    catch (err) {
        console.log(err);
        res.status(406).json(err)


    }
}

 

// Api to mark appointment completed for  doctorpanel


exports.AppointmentComplete = async (req, res) => {
    try {
        const docId = req.doctor.id
        const { appointmentId } = req.body

        const appointmentData = await AppointmentModel.findById(appointmentId)

        // prevent double completed
        if (appointmentData.isCompleted) {
            return res.status(500).json("Appointment already completed")
        }


        if (appointmentData && appointmentData.docId == docId) {
            await AppointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.status(200).json("Appointment completed")



        }
        else {
            return res.status(500).json("Mark failed ")
        }









    }
    catch (err) {
        console.log(err);
        res.status(401).json(err)

    }
}













// Api to cancel  appointment  for  doctorpanel


exports.AppointmentCancel = async (req, res) => {
    try {
        const docId = req.doctor.id
        const { appointmentId } = req.body

        const appointmentData = await AppointmentModel.findById(appointmentId)
        if (appointmentData.cancelled) {
            return res.status(500).json("Appointment Already cancelled")
        }

        if (appointmentData && appointmentData.docId == docId) {
            await AppointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.status(200).json("Appointment cancelled")



        }
        else {
            return res.status(500).json(" cancellation failed ")
        }









    }
    catch (err) {
        console.log(err);
        res.status(401).json(err)

    }
}



// Api to get dashboard data for doctor panel 

exports.doctorDashboard = async (req, res) => {

    try {
        const docId = req.doctor.id
        const appointments = await AppointmentModel.find({ docId })
        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount



            }

        })
        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })
        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        res.status(200).json(dashData)




    }
    catch (err) {
        console.log(err);
        res.status(401).json(err)

    }
}


// Api for get Doctor profile 

exports.GetDoctorProfile = async (req, res) => {
    try {
        const docId=req.doctor.id
        const doctorprofile=await doctorModel.findById(docId).select('-password')
        console.log(doctorprofile);
        res.status(200).json(doctorprofile)
        

    }
    catch (err) {
        console.log(err);
        res.status(401).json(err)

    }

}




// Api for updating Doctor profile

exports.updateDoctorProfile=async(req,res)=>{
    try{
        
        const docId=req.doctor.id
        const {name, speciality,   experience, about, fees,  address}=req.body

        const updateDoctor=await doctorModel.findByIdAndUpdate(docId,{name,speciality,experience,about,fees,address})


        res.status(200).json(updateDoctor)

    }
    catch(err){
        console.log(err);
        res.status(401).json(err)
        
    }
}