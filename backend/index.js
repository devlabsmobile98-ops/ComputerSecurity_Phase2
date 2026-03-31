require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const voterRoutes = require("./routes/voterRoutes");
const healthRoutes = require("./routes/healthRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: false
}));

app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/voter", voterRoutes);
app.use("/health", healthRoutes);

app.use(errorMiddleware);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Vote Guard backend running on port ${process.env.PORT || 3000} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });