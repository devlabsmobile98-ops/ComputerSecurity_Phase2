function errorMiddleware(err, req, res, next) {
  console.error("Unhandled error:", err);

  return res.status(500).json({
    error: err.message || "Internal server error"
  });
}

module.exports = errorMiddleware;