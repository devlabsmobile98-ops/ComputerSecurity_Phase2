const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/nonce", authController.requestNonce);
router.post("/verify", authController.verifySignature);
router.get("/session", authMiddleware, authController.session);

module.exports = router;