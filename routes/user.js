const express = require("express");

const router = express.Router();

const userController = require("../controllers/UserController");
const auth = require("../middleware/auth");

router.get("/user/me", auth, userController.getProfile);

router.post("/register", userController.registerUser);

// add auth when done
router.post("/user", userController.updateUser);

module.exports = router; // export to use in server.js
