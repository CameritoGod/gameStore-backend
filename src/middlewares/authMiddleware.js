const jwt = require("jsonwebtoken");

// Middleware para verificar si el usuario está autenticado
const authMiddleware = (req, res, next) => {
  try {
    // Buscamos el token en los headers (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    // Verificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos la info del usuario en req.user para usarla en rutas protegidas
    req.user = decoded;

    next(); // sigue al siguiente middleware o controlador
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Middleware opcional para verificar roles
const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos para esta acción" });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
