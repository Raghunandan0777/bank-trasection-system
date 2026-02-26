
const express = require('express');
const middleware = require('../middleware/auth.middleware');
const transactionController = require('../controller/transaction.controller');
const createInitialTransaction = require('../controller/transaction.controller');
const router = express.Router();

 
// post:/api/transaction/
router.post("/", transactionController.createTransaction,middleware.authMiddleware)


// create initial fund trsaction form system user
//  post:/api/transaction/system/initial-fund
router.post("/system/initial-fund", transactionController.createInitialTransaction,middleware.authSystemUserMiddleware)
 

module.exports = router