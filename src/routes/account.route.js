const accountController = require("../controller/account.controller")
const authMiddleware = require("../middleware/auth.middleware")

const express = require("express")

const router = express.Router()

// All account routes are protected


// POST:   /api/account/         — Create a new account
router.post("/", accountController.createAccountController,authMiddleware.authMiddleware)

// GEt:    /api/account/         — Get all accounts of the authenticated user
router.get("/", accountController.getUserAccountsController,authMiddleware.authMiddleware) 

// GET:    /api/account/:id      — Get   a specific account balance by ID 

router.get("/:id", accountController.getAccountBalanceController,authMiddleware.authMiddleware)

module.exports = router