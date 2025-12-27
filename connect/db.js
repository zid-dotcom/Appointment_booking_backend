const mongoose=require('mongoose')


mongoose.connect((process.env.DATABASE)).then(()=>{
    console.log('server connected to mongodb');
    
}).catch((err)=>{
    console.log(err);

    
})