require("dotenv").config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const gamesRouter = require('./src/routes/juegosRoutes');
app.use('/api/gamesCatalogo', gamesRouter);

const authRouter = require('./src/routes/authRoutes');
app.use('/api/auth', authRouter);

const userRouter = require('./src/routes/userRoutes');
app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});