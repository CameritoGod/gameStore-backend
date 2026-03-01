require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 🎯 PORT dinámico: Render asigna el puerto mediante process.env.PORT
const PORT = process.env.PORT || 3000;

// 🌐 CORS: Permite conexiones desde tu frontend en desarrollo y producción
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tu-frontend.vercel.app',  // 👈 Cambiar por tu dominio real en Vercel
    /\.vercel\.app$/                   // Permite previews de Vercel
  ],
  credentials: true
}));

app.use(express.json());

// 📁 Servir archivos estáticos (IMÁGENES)
// Multer guarda en: backend/public/uploads/avatars/
// Esta línea expone esa carpeta en: https://tudominio.com/uploads/avatars/
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 🧭 Rutas
const gamesRouter = require('./src/routes/juegosRoutes');
app.use('/api/gamesCatalogo', gamesRouter);

const authRouter = require('./src/routes/authRoutes');
app.use('/api/auth', authRouter);

const userRouter = require('./src/routes/userRoutes');
app.use('/user', userRouter);

const adminRouter = require('./src/routes/adminRoutes');
app.use('/admin', adminRouter);

// 🚀 Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});