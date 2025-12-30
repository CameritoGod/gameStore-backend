const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const gamesRouter = require('./src/routes/juegosRoutes');
app.use('/api/gamesCatalogo', gamesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});