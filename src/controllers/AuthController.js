const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const nodemailer = require("nodemailer");

class AuthController {

  // REGISTRO
  async register(req, res) {
    try {
      const { nombre, nickname, email, password } = req.body;

      if (!nombre || !nickname || !email || !password) {
        return res.status(400).json({ message: "Datos incompletos" });
      }

      const [exists] = await db.query(
        "SELECT id_usuario FROM usuarios WHERE email = ?",
        [email]
      );

      if (exists.length > 0) {
        return res.status(409).json({ message: "El correo ya está registrado" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        `INSERT INTO usuarios (nombre, nickname, email, password, rol)
         VALUES (?, ?, ?, ?, ?)`,
        [nombre, nickname, email, passwordHash, "cliente"]
      );

      const token = jwt.sign(
        { id_usuario: result.insertId, rol: "cliente" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.status(201).json({
        id_usuario: result.insertId,
        nombre,
        nickname,
        email,
        rol: "cliente",
        token
      });

    } catch (error) {
      res.status(500).json({ message: "Error en el registro" });
    }
  }

  // ======================
  // LOGIN
  // ======================

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Datos obligatorios" });
      }

      const [rows] = await db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email.trim().toLowerCase()]
      );

      if (!rows.length) {
        return res.status(401).json({ message: "Cuenta no encontrada" });
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { id: user.id_usuario, role: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({
        id: user.id_usuario,
        nickname: user.nickname,
        name: user.nombre,
        email: user.email,
        role: user.rol,
        token
      });

    } catch (error) {
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  }

  //Funcion para la recuperacion de contraseña
  //mediante codigo enviado por correo electronico
  // ======================
  // 1 PEDIR CÓDIGO
  // ======================

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
    
      const [users] = await db.query(
        "SELECT id_usuario, nickname FROM usuarios WHERE email = ?",
        [email.trim().toLowerCase()]
      );
    
      if (!users.length) {
        return res.status(404).json({ message: "Correo no registrado" });
      }
    
      const user = users[0];
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000);
    
      await db.query(
        "UPDATE usuarios SET reset_code = ?, reset_expires = ? WHERE id_usuario = ?",
        [cdoe, expires, user.id_usuario]
      );
    
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });
    
      await transporter.sendMail({
        from: `"GameStore" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Recuperación de contraseña",
        html: `
          <h2>GameStore</h2>
          <p>Tu código de recuperación es:</p>
          <h1>${code}</h1>
          <small>Válido por 10 minutos</small>
        `
      });
    
      res.json({
        nickname: user.nickname,
        message: "Código enviado al correo"
      });
    
    } catch (error) {
      console.error("Error forgotPassword:", error);
      res.status(500).json({ message: "Error al enviar el código" });
    }
  }


  // ======================
  // 2 VERIFICAR CÓDIGO
  // ======================

  async verifyCode(req, res) {
    const { email, code } = req.body;

    const [rows] = await db.query(
      `SELECT id_usuario FROM usuarios
       WHERE email = ? AND reset_code = ? AND reset_expires > NOW()`,
      [email, code]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    res.json({ message: "Código válido" });
  }

  // ======================
  // 3 CAMBIAR CONTRASEÑA
  // ======================

  async resetPassword(req, res) {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE usuarios
       SET password = ?, reset_code = NULL, reset_expires = NULL
       WHERE email = ?`,
      [hash, email]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  }
}

module.exports = new AuthController();
