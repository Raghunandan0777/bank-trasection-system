
const  mongoose = require("mongoose");
const ladgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:["account must be associated with user"],
        index:true,
    },

    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSE"],
            message:"atatus either  ACTIVE, FROZEN or CLOSE",
        },
        default:"ACTIVE"
    },

    currency:{
        type:String,
        required:["currency is required for creating an account"],
        default:"INR"
    }
},{timestamps:true})

accountSchema.index({user:1,status:1})



// instance method to get balance of the account
accountSchema.methods.getBalance = async function(){   
    
    const balanceData = await ladgerModel.aggregate([
        {$match:{account: this._id}},
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:{
                            if:{$eq:["$type","DEBIT"]},
                            then:"$amount",
                            else:0
                        }
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:{
                            if:{$eq:["$type","CREDIT"]},
                            then:"$amount",
                            else:0
                        }
                    }
                }
            }
        },

        {
            $project:{
                _id:0,
                balance:{$subtract:["$totalCredit","$totalDebit"]}
            }
        }
    ])

    if(balanceData.length === 0){
        return 0;
    }
    return balanceData[0].balance;
}



const accountModel = mongoose.model("account",accountSchema)

module.exports = accountModel