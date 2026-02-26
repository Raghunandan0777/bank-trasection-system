
const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Trasaction must be from account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Trasaction must be to account"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status must be either PENDING, COMPLETED, FAILED, OR REVERSED"
        },
        default: "PENDING",
    },

    amount: {
        type: Number,
        required: [true, "Amount is required for creating an transaction"],
        min: [0, "Transaction amount can not be negative"]
    },
    idompotencyKey:{
        type:String,
        required:[true,"IdompotencyKey is require for creating a transaction"],
        index:true,
        unique:true

    }
}, { timestamps: true })


const transactionModel = mongoose.model("transaction", transactionSchema)

module.exports = transactionModel