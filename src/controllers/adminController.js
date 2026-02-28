const db = require('../database/db');

class AdminController {

  async getAllPurchases(req, res) {
    try {
      const [results] = await db.query(`
        SELECT 
          u.nickname,
          c.id_compra,
          c.fecha_compra,
          dc.precio,
          jr.nombre AS juego
        FROM compras c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        JOIN detalle_compra dc ON c.id_compra = dc.id_compra
        JOIN juegos_referencia jr ON dc.id_juego = jr.id_juego
        ORDER BY c.fecha_compra DESC
      `);

      res.status(200).json(results);
    } catch (error) {
      console.error("Error getAllPurchases:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  // ✅ VERSIÓN CORREGIDA
  async addDiscount(req, res) {
    const { gameId, discount, endDate, nombre, imagen } = req.body;
    
    try {
      // Validar datos requeridos
      if (!gameId || !discount || !endDate) {
        return res.status(400).json({ message: "Faltan datos requeridos" });
      }

      // Verificar si el juego existe, si no, insertarlo
      const [gameRows] = await db.query(
        'SELECT id_juego FROM juegos_referencia WHERE id_juego = ?',
        [gameId]
      );

      if (gameRows.length === 0) {
        if (!nombre || !imagen) {
          return res.status(400).json({ 
            message: "Para crear un nuevo juego se requiere nombre e imagen" 
          });
        }
        
        await db.query(
          'INSERT INTO juegos_referencia (id_juego, nombre, imagen_url) VALUES (?, ?, ?)',
          [gameId, nombre, imagen]
        );
      }

      // ✅ Desestructura el resultado para obtener los datos del INSERT
      const [result] = await db.query(
        `INSERT INTO descuentos (id_juego, porcentaje, fecha_inicio, fecha_fin, creado_por) 
         VALUES (?, ?, CURDATE(), ?, ?)`,
        [gameId, discount, endDate, req.user.id]
      );

      // ✅ Usa result.`insertId` (no db.connect.insertId)
      res.status(201).json({ 
        message: "Descuento agregado correctamente",
        discountId: result.insertId 
      });
    } catch (error) {
      console.error("Error addDiscount:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = new AdminController();