
const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({

    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required:[true, "Ledger must be  associated with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true, "Ledger must have an amount"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true, "Ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },

    type:{
        type:String,
        enum:["debit", "credit"],
        required:[true, "Ledger must have a type"],
        immutable:true
    }

}, {timestamps:true})

function preventLedgerModification(){
    throw new Error("Ledger entries cannot be modified or deleted")

}


ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);



const ladgerModel = mongoose.model("ledger", ledgerSchema)

module.exports = ladgerModel