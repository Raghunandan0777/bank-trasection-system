
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")


const authMiddleware = async(req,res,next) => {
  
    let token = req.cookies.token || req.headers.authorization?.split("")[1]
    
    if(!token){
        return res.status(400).json({success:false,message:"token not provided"})
    }

    try {

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId)
        req.user = user
        next()
        
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"internal server error"})
        
        
    }
}

const authSystemUserMiddleware = async(req,res,next) => {
     let token = req.cookies.token || req.headers.authorization?.split("")[1]
    
    if(!token){
        return res.status(400).json({success:false,message:"token not provided"})
    }

    try {

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({success:false,message:"access denied"})
        }
        req.user = user
        next()
        
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false,message:"invalid token"})
        
        
    }
}



module.exports = {
    authMiddleware,
    authSystemUserMiddleware

} 