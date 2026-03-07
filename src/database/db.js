const mysql = require("mysql2/promise");

const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: isProduction
    ? {
        rejectUnauthorized: false
      }
    : false,

  connectTimeout: 10000
};

const db = mysql.createPool(dbConfig);

(async () => {
  try {
    const connection = await db.getConnection();
    console.log(`✅ DB conectada: ${dbConfig.database}`);
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar a la BD:", error.message);
  }
})();

module.exports = db;