const admincontroller=require('../controllers/admincontroller')
const DoctorController=require('../controllers/doctorcontroller')
const UserController=require('../controllers/userController')

const upload=require('../middlewares/multer')
const AuthadminMiddleware=require('../middlewares/AuthAdmin')
const AuthuserMiddleware=require('../middlewares/AuthUser')
const DoctorAuthenticationMiddleware=require('../middlewares/AuthDoctor')

const express=require('express')

const router=express.Router()






// admin route

router.post('/admin/add-doctor',AuthadminMiddleware,upload.single('image'),admincontroller.addDoctor)
router.get('/adminlistdoctor', AuthadminMiddleware,admincontroller.getAlldoctors)
router.post('/adminlogin',admincontroller.loginAdmin)
router.post('/change-availability/:id',AuthadminMiddleware,admincontroller.ChangeAvailabilityStatus)
router.get('/getAllappointment',AuthadminMiddleware,admincontroller.GetAllappointments)
router.put('/AdmincancelAppointment',AuthadminMiddleware,admincontroller.CancelAppointment)
router.get('/getDashData',AuthadminMiddleware,admincontroller.adminDashboard)




// Doctor route
router.post('/doctorlogin',DoctorController.LoginDoctor)
router.get('/listdoctorAppointments',DoctorAuthenticationMiddleware,DoctorController.appointmentsDoctor)
router.put('/complete-appointment',DoctorAuthenticationMiddleware,DoctorController.AppointmentComplete)
router.put('/cancel-appointment',DoctorAuthenticationMiddleware,DoctorController.AppointmentCancel)
router.get('/get-dashdata',DoctorAuthenticationMiddleware,DoctorController.doctorDashboard)
router.get('/doc-profile',DoctorAuthenticationMiddleware,DoctorController.GetDoctorProfile)
router.put('/updateDoc-profile',DoctorAuthenticationMiddleware,DoctorController.updateDoctorProfile)

 


// user route


router.post('/reg',UserController.UserRegister)
router.post('/login',UserController.UserLogin)
router.get('/getprofile',AuthuserMiddleware,UserController.getUserprofile)
router.put('/updateprofile',upload.single('image'),AuthuserMiddleware,UserController.Updateprofile)
router.post('/bookappointment',AuthuserMiddleware,UserController.BookAppointment)
router.get('/listAlldoctors',UserController.listAllDoctors)
router.get('/listappointments',AuthuserMiddleware,UserController.getUserAppointments)

// for canceling appointment we can use both req.params and req.body

// router.put('/cancel-appointment/:appointmentId',AuthuserMiddleware,UserController.CancelAppointmentApi)
router.put('/cancel',AuthuserMiddleware,UserController.CancelAppointmentApi)


// razor pay order creating route
router.post('/payment',AuthuserMiddleware,UserController.payementRazerpay)


// verify razorpay route
router.post('/verifyrazorpay',AuthuserMiddleware,UserController.verifyRazorpay)





module.exports=router
