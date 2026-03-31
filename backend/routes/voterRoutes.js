const express = require("express");
const router = express.Router();
const voterController = require("../controllers/voterController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(requireRole("voter"));

router.get("/status", voterController.getStatus);
router.post("/receipt", voterController.recordVoteReceipt);

module.exports = router;