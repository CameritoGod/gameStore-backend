const rateLimit = require("express-rate-limit");

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    message: "Demasiados intentos, intenta más tarde"
  }
});
