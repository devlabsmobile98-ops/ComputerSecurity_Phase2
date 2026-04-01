const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);
router.use(requireRole("admin"));

router.post("/register", adminController.registerVoter);
router.get("/overview", adminController.getOverview);
router.get("/results", adminController.getResults);
router.get("/region-stats", adminController.getRegionStats);
router.post("/open-election", adminController.openElection);
router.post("/close-election", adminController.closeElection);

module.exports = router;
