const jwt=require('jsonwebtoken')

// admin authentication middleware





const AdminAuthenticationMiddleware=(req,res,next)=>{

    try{
        const {atoken}=req.headers
          if(!atoken){
            return res.status(404).json('Token is not authorized')
        }
        else{
            const token_decode=jwt.verify(atoken,process.env.JWT_SECRET)
            if(token_decode!==process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD){
                return res.status(404).json('token is not authorized please login again')
            }
            else{
                next()
            }
        }

    }
    
    catch(err){
        console.log(err); 
        res.status(401).json(err)
        
    }
}

module.exports=AdminAuthenticationMiddleware



