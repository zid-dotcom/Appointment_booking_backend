require('dotenv').config()

const express=require('express')
const cors=require('cors')
require('./connect/db')
const router=require('./routes/router')



const connectcloudinary=require('./config/cloudinary')





const server=express()
server.use(cors())
server.use(express.json())
// server.use(express.urlencoded({ extended: true })); // safe to include even if you don't use form posts




server.use(router)
connectcloudinary()
const PORT=process.env.PORT||3000

server.listen(PORT,()=>{
    console.log(`server is running at :${PORT}`);
    
})
 
