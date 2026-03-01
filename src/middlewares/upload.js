// src/middlewares/uploadAvatar.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🎯 Ruta absoluta: backend/public/uploads/avatars
    const uploadPath = path.join(__dirname, '../../public/uploads/avatars');
    
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nombre único: userId-timestamp.extension
    const userId = req.user?.id || Date.now();
    const uniqueSuffix = `${userId}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);
  
  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes: JPG, PNG, WEBP, GIF'), false);
  }
};

// Instancia de multer con límites
const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Máximo 5MB
});

module.exports = { uploadAvatar };