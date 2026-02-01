  const bcrypt = require('bcrypt');
  const db = require('../database/db');

  class UserController {

      async updateProfile(req, res) {
          try {
            const { id } = req.params;
            const { nombre, nickname, email, password } = req.body;
          
              const hash = await bcrypt.hash(password, 10);
          
              await db.query(
                `UPDATE usuarios 
                SET nombre = ?, nickname = ?, email = ?, password = ? 
                WHERE id_usuario = ?`,
                [nombre, nickname, email, hash, id]
              );

              res.status(200).json({ message: "Perfil actualizado correctamente" });
            
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
    }

    async addFavorite(req, res) {
      try {
        const { id_usuario, id_juego, nombre, imagen_url } = req.body;
      
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
        const { id_usuario } = req.params;
      
        // Usamos await para esperar el resultado de la base de datos
        const [results] = await db.query(
          `SELECT f.id_juego, f.fecha_agregado, jr.nombre, jr.imagen_url 
          FROM favoritos f 
          JOIN juegos_referencia jr ON f.id_juego = jr.id_juego 
          WHERE f.id_usuario = ?`,
          [id_usuario]
        );
      
        // results suele ser un array con las filas encontradas
        res.status(200).json(results);
        
      } catch (error) {
        console.error("Error en getFavorites:", error);
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }

    async deleteFavorite(req, res) {
      try {
        const id_usuario = req.user.id;   // viene del JWT
        const { id_juego } = req.params;  // viene de la URL
      
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
  }

  module.exports = new UserController();