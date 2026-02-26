
const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');
const { sendEmail, sendRegisterEmail } = require('../services/email.services');
const ladgerModel = require('../models/ledger.model');




const createTransaction = async (req, res) => {


    //1. validation 
    const { fromAccount, toAccount, amount, idompotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idompotencyKey) {
        return res.status(400).json({
            success: false,
            message: "fromAccount, toAccount, amount and idompotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount, })

    const toUserAccount = await accountModel.findOne({ _id: toAccount, })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            success: false,
            message: " invalid fromAccount or toAccount "
        })
    }

    // 2.validate IdompotencyKey

    const isTransactionExist = await transactionModel.findOne({ idompotencyKey: idompotencyKey })

    if (isTransactionExist) {
        if (isTransactionExist.status === "PENDING") {
            return res.status(200).json({
                success: true,
                message: "Transaction is already in progress",
                transaction: isTransactionExist
            })
        }
        if (isTransactionExist.status === "COMPLETED") {
            return res.status(200).json({
                success: true,
                message: "Transaction is already completed",
                transaction: isTransactionExist
            })
        }
        if (isTransactionExist.status === "FAILED") {
            return res.status(500).json({
                success: true,
                message: "Transaction is already failed",
                transaction: isTransactionExist
            })
        }
        if (isTransactionExist.status === "REVERSED") {
            return res.status(500).json({
                success: true,
                message: "Transaction is already reversed",
                transaction: isTransactionExist
            })
        }
    }


    // 3.check Account status

    if (fromUserAccount.status !== "active" || toUserAccount.status !== "active") {
        return res.status(400).json({
            success: false,
            message: "Both fromAccount and toAccount must be active to perform a transaction"
        })
    }

    //4. check sender balance from ledger

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            success: false,
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }



    // 5. create transaction and ledger entries From (PENDING -> COMPLETED/FAILED)

    const session = await transactionModel.startSession();
    session.startTransaction();

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idompotencyKey,
        status: "PENDING"

    }, { session })

    const debitLedgerEntry = await ladgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }, { session })

    const creditLedgerEntry = await ladgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction();
    session.endSession();


    // 6.send email notification to both sender and receiver 

    await emailService.sendRegisterEmail(fromUserAccount.user, "Transaction Alert", `You have sent ${amount} to account ${toAccount}. Transaction ID: ${transaction._id}`)

    await emailService.sendRegisterEmail(toUserAccount.user, "Transaction Alert", `You have received ${amount} from account ${fromAccount}. Transaction ID: ${transaction._id}`)

    return res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        transaction,
        debitLedgerEntry,
        creditLedgerEntry
    })


}

const createInitialTransaction = async (req,res) => {
    const { toAccount, amount, idompotencyKey } = req.body;

    if (!toAccount || !amount || !idompotencyKey) {
        return res.status(400).json({
            success: false,
            message: "toAccount, amount and idompotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount, })

    if (!toUserAccount) {
        return res.status(400).json({
            success: false,
            message: " invalid toAccount "
        })
    }
   
    const session = await transactionModel.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        toAccount,
        amount,
        idompotencyKey,
        status: "PENDING"
    })
     
    const debitLedgerEntry = await ladgerModel.create([{     
    account: null,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ladgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session }) 

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        success: true,
        message: "Initial transaction created successfully",
        transaction
    })
}
module.exports = {
    createTransaction,
    createInitialTransaction
}