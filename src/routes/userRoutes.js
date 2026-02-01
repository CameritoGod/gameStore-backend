    const express = require('express');
    const router = express.Router();
    const userController = require('../controllers/userController');
    const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

    //Rutas

    //Rutas para actualizarr el usuario
    router.put('/:id', 
        authMiddleware, 
        userController.updateProfile
    );

    //Rutas para agregar juegos a favoritos al usuario
    router.post('/favorites', 
        authMiddleware, 
        userController.addFavorite
    );

    //Rutas para obtener los juegos favoritos del usuario
    router.get('/favorites/:id_usuario', 
        authMiddleware, 
        userController.getFavorites
    );

    //Ruta para eliminar juegos de favoritos del usuario
    router.delete(
      '/favorites/:id_juego',
      authMiddleware,
      userController.deleteFavorite
    );

    module.exports = router;