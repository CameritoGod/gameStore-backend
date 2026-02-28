require("dotenv").config();

const express = require('express');
const cors = require('cors');
// const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
// ✅ Esto debe estar para que las imágenes sean accesibles:
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const gamesRouter = require('./src/routes/juegosRoutes');
app.use('/api/gamesCatalogo', gamesRouter);

const authRouter = require('./src/routes/authRoutes');
app.use('/api/auth', authRouter);

const userRouter = require('./src/routes/userRoutes');
app.use('/user', userRouter);

const adminRouter = require('./src/routes/adminRoutes');
app.use('/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});