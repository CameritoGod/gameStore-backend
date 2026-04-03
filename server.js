require("dotenv").config();

const express = require('express');
const cors = require('cors');  // ← ✅ UNA SOLA VEZ, al inicio
const path = require('path');

const app = express();

// PORT dinámico: Render asigna el puerto mediante process.env.PORT
const PORT = process.env.PORT || 3000;

// Lista de orígenes permitidos (SIN ESPACIOS EXTRA)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',                        // Vite local
  'http://localhost:3000',                        // CRA local
  'https://gamestoredev.vercel.app/',             // Dominio REAL (sin espacios)
  /\.vercel\.app$/                                // Permite cualquier preview de Vercel
];

// Configuración de CORS con función personalizada
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'] // ✅ Asegúrate de tener 'Accept'
}));

app.use(express.json());

// Servir archivos estáticos (IMÁGENES)
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
  console.log(` Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});