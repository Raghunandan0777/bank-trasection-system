const express = require("express")
const  {userRegister, userLogin } = require("../controller/auth.controller");

const router = express.Router()


/* POST /api/auth/register   */
router.post("/register",userRegister)

 /* POST /api/auth/login   */
router.post("/login",userLogin)

module.exports = router;