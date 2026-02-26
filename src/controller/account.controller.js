
const accountModel = require('../models/account.model');


const createAccountController = async (req, res) => {

    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        success: true,
        message: "account created successfully!",
        account
    })
}


 const getUserAccountsController = async(req,res) => {
    const user = req.user;  
    const accounts = await accountModel.find({user:user._id})

    res.status(200).json({
        success:true,
        message:"accounts fetched successfully",
        accounts
    })
}


 const getAccountBalanceController = async(req,res) => {
    const {accountId} = req.params;

    const account = await accountModel.findOne({_id:accountId,user:req.user._id})
    if(!account){
        return res.status(404).json({
            success:false,
            message:"account not found"
        })
    }
    res.status(200).json({
        success:true,
        message:"account balance fetched successfully",
        balance:account.balance
    })
 }



module.exports = {
    createAccountController,
    getUserAccountsController
} 