// backend/src/controllers/userController.js
const bcrypt = require('bcrypt');
const db = require('../database/db');
const path = require('path');
const fs = require('fs').promises;

class UserController {

 // Actualizar avatar (con rutas absolutas correctas)
  async updateAvatar(req, res) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No se recibió ninguna imagen' });
      }

      const userId = req.user.id;
      // Obtener la URL base de Render (sin barra al final)
      const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, '');

      // 1. Obtener avatar anterior de la BD para borrar el archivo físico
      const [oldUser] = await db.query('SELECT avatar_url FROM usuarios WHERE id_usuario = ?', [userId]);
      const oldAvatarUrl = oldUser[0]?.avatar_url;

      if (oldAvatarUrl && !oldAvatarUrl.includes('default-avatar.png')) {
        // Extraer el nombre del archivo de la URL guardada
        const fileName = oldAvatarUrl.split('/').pop();
        const oldPath = path.join(__dirname, '../../public/uploads/avatars', fileName);
        
        try {
          await fs.access(oldPath);
          await fs.unlink(oldPath);
          console.log('🗑️ Archivo anterior eliminado');
        } catch (err) {
          console.log('⚠️ No se pudo eliminar el archivo anterior o no existe');
        }
      }

      // 2. Guardar la nueva URL (usando la base de Render)
      const newAvatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
      await db.query('UPDATE usuarios SET avatar_url = ? WHERE id_usuario = ?', [newAvatarUrl, userId]);

      res.status(200).json({
        message: 'Avatar actualizado con éxito',
        avatar_url: newAvatarUrl
      });

    } catch (error) {
      console.error("❌ Error en updateAvatar:", error);
      res.status(500).json({ message: 'Error interno al actualizar avatar' });
    }
  }

  // ✅ Actualizar perfil (sin cambios de lógica, solo sintaxis CommonJS)
  async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, nickname, email, password } = req.body;
    
      const hash = password === "********" || !password
        ? undefined
        : await bcrypt.hash(password, 10);
    
      const query = hash 
        ? `UPDATE usuarios SET nombre = ?, nickname = ?, email = ?, password = ? WHERE id_usuario = ?`
        : `UPDATE usuarios SET nombre = ?, nickname = ?, email = ? WHERE id_usuario = ?`;
        
      const params = hash 
        ? [name, nickname, email, hash, id]
        : [name, nickname, email, id];
    
      await db.query(query, params);

      res.status(200).json({ message: "Perfil actualizado correctamente" });
    
    } catch (error) {
      console.error("Error updateProfile:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // ✅ Tus métodos de favoritos (sin cambios)
  async addFavorite(req, res) {
    try {
      const id_usuario = req.user.id;
      const { id_juego, nombre, imagen_url } = req.body;
      
      const [existing] = await db.query(`SELECT id_juego FROM juegos_referencia WHERE id_juego = ?`, [id_juego]);
      
      if (existing.length === 0) {
        await db.query(
          `INSERT INTO juegos_referencia (id_juego, nombre, imagen_url) VALUES (?, ?, ?)`,
          [id_juego, nombre, imagen_url]
        );
      }
    
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

  // ✅ Tus métodos de compras (sin cambios)
  async addPurchases(req, res) {
    try {
      const id_usuario = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items inválidos" });
      }

      await db.query(
        `INSERT INTO compras (id_usuario, fecha_compra) VALUES (?, ?)`,
        [id_usuario, new Date()]
      );

      const [compra] = await db.query(`SELECT LAST_INSERT_ID() AS id_compra`);
      const id_compra = compra[0].id_compra;

      for (const item of items) {
        const { id_juego, nombre, imagen_url, precio } = item;

        if (!id_juego || !precio) continue;

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