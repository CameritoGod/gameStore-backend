const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Middleware global
router.use(authMiddleware);

//Ruta para historial de compras

router.route('/purchases')
  .get(roleMiddleware('admin'), AdminController.getAllPurchases);
 
router.route('/discounts')
  .post(roleMiddleware('admin'), AdminController.addDiscount)

module.exports = router;