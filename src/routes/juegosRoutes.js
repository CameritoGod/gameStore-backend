const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');

router.get('/trending', gamesController.gamesTrending);
router.get('/recommendations', gamesController.gameRecommendations);
router.get('/all', gamesController.gamesAll);
router.get('/:id', gamesController.gameById);



// Exportamos el router
module.exports = router;