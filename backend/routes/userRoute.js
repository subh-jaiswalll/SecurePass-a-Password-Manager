const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController.js");

router.post("/login", userController.loginUser);

router.post("/register", userController.registerUser);

router.post("/forget-password", userController.forgetPassword);

router.post("/reset-password/:token", userController.resetPassword);

module.exports = router;
