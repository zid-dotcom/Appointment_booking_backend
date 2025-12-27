const jwt=require('jsonwebtoken')

// doctor Authentication middleware


const doctorAuthenticationMiddleware=async(req,res,next)=>{
    try{
        const {dtoken}=req.headers
        if(!dtoken){
            return res.status(406).json("Token invalid ")
        }
        else{
            const token_decode=jwt.verify(dtoken,process.env.JWT_SECRET)
            console.log(token_decode);

            req.doctor={id:token_decode.id}
            // req.body.docId=token_decode.id
            // console.log(req.Doctor);

            next()
            
            

        }

    }
    catch(err){
        console.log(err);
        res.status(401).json(err)
        
    }
}

module.exports=doctorAuthenticationMiddleware