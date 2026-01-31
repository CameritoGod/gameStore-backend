const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "gamestoredata",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

    // Prueba de conexión
    (async () => {
      try {
        const connection = await db.getConnection();
        console.log("Base de datos conectada con éxito");
        connection.release();
      } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
      }
    })();

    module.exports = db;