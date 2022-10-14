const express = require("express");
const router = express.Router();

//controllers
const { login, register } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", register);

module.exports = router;
