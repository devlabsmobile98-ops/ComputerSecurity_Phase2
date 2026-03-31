const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "Vote Guard API healthy" });
});

module.exports = router;