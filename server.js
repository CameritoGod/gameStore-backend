require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// PORT dinámico: Render asigna el puerto mediante process.env.PORT
const PORT = process.env.PORT || 3000;

// CORS: Permite conexiones desde tu frontend en desarrollo y producción
const cors = require('cors');

// Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
  'http://localhost:5173',              // Vite local
  'http://localhost:3000',              // CRA local
  'https://game-store-frontend-three.vercel.app',  // 👈 Tu dominio REAL de Vercel
  /\.vercel\.app$/                      // 👈 Permite cualquier preview de Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, curl, o server-to-server)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida
    if (ALLOWED_ORIGINS.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    )) {
      callback(null, true);
    } else {
      console.warn(` CORS bloqueado para origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Permitir cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir archivos estáticos (IMÁGENES)
// Multer guarda en: backend/public/uploads/avatars/
// Esta línea expone esa carpeta en: https://tudominio.com/uploads/avatars/
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
const gamesRouter = require('./src/routes/juegosRoutes');
app.use('/api/gamesCatalogo', gamesRouter);

const authRouter = require('./src/routes/authRoutes');
app.use('/api/auth', authRouter);

const userRouter = require('./src/routes/userRoutes');
app.use('/user', userRouter);

const adminRouter = require('./src/routes/adminRoutes');
app.use('/admin', adminRouter);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});