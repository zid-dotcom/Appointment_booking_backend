const cloudinary=require('cloudinary').v2


const connectCloudinary=async()=>{
    cloudinary.config({
        cloud_name:process.env.CLOUDINARYNAME,
        api_key:process.env.CLODINARYAPIKEY,
        api_secret:process.env.CLOUDINARYSECRETKEY
    })

    
}



module.exports=connectCloudinary


