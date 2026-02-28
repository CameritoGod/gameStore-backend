const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadAvatar } = require('../middlewares/upload'); // ✅ Importar multer

// Middleware global de autenticación
router.use(authMiddleware);

// ✅ NUEVA: Ruta para actualizar avatar
router.put('/avatar', uploadAvatar.single('avatar'), userController.updateAvatar);

// PERFIL
router.route('/:id')
  .put(userController.updateProfile);

// FAVORITOS
router.route('/favorites')
  .get(userController.getFavorites)
  .post(userController.addFavorite);
 
router.route('/favorites/:id_juego')
  .delete(userController.deleteFavorite);
 
// COMPRAS
router.route('/purchases')
  .post(userController.addPurchases)
  .get(userController.getPurchases);
  
module.exports = router;