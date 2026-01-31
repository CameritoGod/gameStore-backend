const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");
const { forgotPasswordLimiter } = require("../middlewares/rateLimit");

// Rutas públicas

//Ruta para registrar usuario
router.post("/register", authController.register);

//Ruta para logeuar usuario
router.post("/login", authController.login);

//Ruta para pedir codigo de cambio de contraseña
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  authController.forgotPassword
);

//Ruta para verificar codido
router.post("/verify-code", authController.verifyCode);

//Ruta para cambiar contraseña
router.post("/reset-password", authController.resetPassword);

// Rutas protegidas
router.get("/perfil", authMiddleware, (req, res) => {
  res.json({ message: "Tu perfil", user: req.user });
});

// Rutas solo para admin
// router.post("/descuento", authMiddleware, roleMiddleware(["admin"]), authController.createDiscount);

module.exports = router;