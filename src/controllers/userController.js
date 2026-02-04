  const bcrypt = require('bcrypt');
  const db = require('../database/db');

  class UserController {

      async updateProfile(req, res) {
          try {
            const { id } = req.params;
            const { name, nickname, email, password } = req.body;
          
              const hash = password === "********"
                ? undefined
                : await bcrypt.hash(password, 10);
          
              await db.query(
                `UPDATE usuarios 
                SET nombre = ?, nickname = ?, email = ?, password = ? 
                WHERE id_usuario = ?`,
                [name, nickname, email, hash, id]
              );

              res.status(200).json({ message: "Perfil actualizado correctamente" });
            
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
    }

    async addFavorite(req, res) {
      try {
        const id_usuario = req.user.id; // 👈 DESDE JWT
      const { id_juego, nombre, imagen_url } = req.body;
      
        // 1. Verificar/Insertar referencia del juego
        const [existing] = await db.query(`SELECT id_juego FROM juegos_referencia WHERE id_juego = ?`, [id_juego]);
        
        if (existing.length === 0) {
          await db.query(
            `INSERT INTO juegos_referencia (id_juego, nombre, imagen_url) VALUES (?, ?, ?)`,
            [id_juego, nombre, imagen_url]
          );
        }
      
        // 2. Insertar favorito (Asegúrate de que los nombres de columnas sean correctos)
        await db.query(
          `INSERT INTO favoritos (id_usuario, id_juego, fecha_agregado) VALUES (?, ?, ?)`,
          [id_usuario, id_juego, new Date()]
        );
      
        res.status(200).json({ message: "Agregado a favoritos" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }

    async getFavorites(req, res) {
      try {
        const id_usuario = req.user.id;
      
        const [results] = await db.query(
          `SELECT f.id_juego, f.fecha_agregado, jr.nombre, jr.imagen_url 
           FROM favoritos f
           JOIN juegos_referencia jr ON f.id_juego = jr.id_juego
           WHERE f.id_usuario = ?`,
          [id_usuario]
        );
      
        res.status(200).json(results);
      } catch (error) {
        console.error("Error en getFavorites:", error);
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }


    async deleteFavorite(req, res) {
      try {
        const id_usuario = req.user.id;
        const { id_juego } = req.params;
      
        const [result] = await db.query(
          "DELETE FROM favoritos WHERE id_usuario = ? AND id_juego = ?",
          [id_usuario, id_juego]
        );
      
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Favorito no encontrado" });
        }
      
        res.status(200).json({ message: "Eliminado de favoritos" });
      } catch (error) {
        console.error("Error deleteFavorite:", error);
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }


//Funciones de comoras

  //Agrergar compra
  async addPurchases(req, res) {
    try {
      const id_usuario = req.user.id;
      const { items } = req.body;

      //  Validaciones mínimas
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items inválidos" });
      }

      // Crear la compra
      await db.query(
        `INSERT INTO compras (id_usuario, fecha_compra) VALUES (?, ?)`,
        [id_usuario, new Date()]
      );

      const [compra] = await db.query(`SELECT LAST_INSERT_ID() AS id_compra`);
      const id_compra = compra[0].id_compra;

      // Procesar cada juego
      for (const item of items) {
        const { id_juego, nombre, imagen_url, precio } = item;

        // Validación por item
        if (!id_juego || !precio) continue;

        // Verificar/Insertar referencia del juego
        const [existing] = await db.query(
          `SELECT id_juego FROM juegos_referencia WHERE id_juego = ?`,
          [id_juego]
        );

        if (existing.length === 0) {
          await db.query(
            `INSERT INTO juegos_referencia (id_juego, nombre, imagen_url)
             VALUES (?, ?, ?)`,
            [id_juego, nombre, imagen_url]
          );
        }

        // Insertar detalle de la compra
        await db.query(
          `INSERT INTO detalle_compra (id_compra, id_juego, precio)
           VALUES (?, ?, ?)`,
          [id_compra, id_juego, precio]
        );
      }

      res.status(200).json({ message: "Compra registrada correctamente" });

    } catch (error) {
      console.error("Error addPurchases:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }


  //Mostrar compras historial y detalles
  async getPurchases(req, res) {
    try {
      const id_usuario = req.user.id;
      
      const [results] = await db.query(
        `SELECT c.id_compra, c.fecha_compra, dc.id_juego, dc.precio, jr.nombre, jr.imagen_url
        FROM compras c
        JOIN detalle_compra dc ON c.id_compra = dc.id_compra
        JOIN juegos_referencia jr ON dc.id_juego = jr.id_juego
        WHERE c.id_usuario = ?`,
        [id_usuario]
      );
      
      res.status(200).json(results);
    } catch (error) {
      console.error("Error getPurchases:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

  module.exports = new UserController();