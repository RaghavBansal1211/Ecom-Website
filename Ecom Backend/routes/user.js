const express = require("express");
const router = express.Router();

const {handleUserSignUp, handleUserLogIn} = require("../controller/user");



router.post("/register",handleUserSignUp);
router.post("/login",handleUserLogIn); 



module.exports = router;
