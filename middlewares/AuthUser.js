const jwt=require('jsonwebtoken')




const UserAuthenticationMiddleware=async(req,res,next)=>{
    try{
         const {token}=req.headers 
    if(!token){
        return res.status(401).json('token is not authorized')
    }
    
    else{
        const token_decode=jwt.verify(token,process.env.JWT_SECRET)
        console.log(token_decode);
        
        // req.body.userId=token_decode.id  /* here we passing the id we get after login to requested userId */
           req.user = { id: token_decode.id }     /* token_decode.id */
          console.log(req.user);
          
        next()



       
    }


    }
    catch(err){
        console.log(err);
        res.status(406).json(err)
        
    }
   

}
module.exports=UserAuthenticationMiddleware