const mysql = require("mysql2/promise");

// 🎯 Configuración dinámica según entorno
const isProduction = process.env.NODE_ENV === 'production';

// 🗄️ Parámetros de conexión (prioriza variables de entorno)
const dbConfig = {
  // Host: usa Railway interno en producción, localhost en dev
  host: process.env.DB_HOST || (isProduction ? 'mysql.railway.internal' : 'localhost'),
  
  // Usuario y contraseña
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  
  // Nombre de la base de datos
  database: process.env.DB_NAME || 'gamestoredata',
  
  // Puerto: 3306 para interno, o el que definas en variable
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : (isProduction ? 3306 : 3306),
  
  // ⚙️ Configuración del pool (tus valores originales)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // 🔐 SSL para producción (Railway lo requiere en conexiones externas)
  ssl: isProduction 
    ? { 
        rejectUnauthorized: true,
        // Si usas el host PÚBLICO de Railway, descomenta esto:
        // ca: process.env.DB_SSL_CA // Opcional: certificado personalizado
      } 
    : false,
  
  // ⏱️ Timeouts para evitar conexiones colgadas
  connectTimeout: 10000, // 10 segundos
  acquireTimeout: 10000
};

// 🚀 Crear el pool de conexiones
const db = mysql.createPool(dbConfig);

// 🔍 Prueba de conexión automática (solo en consola, no bloquea la app)
(async () => {
  try {
    const connection = await db.getConnection();
    console.log(`✅ DB conectada: ${dbConfig.database} en ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
  } catch (error) {
    console.error(`❌ Error al conectar a la BD:`, error.message);
    // En producción, esto podría detener el servidor si es crítico:
    if (isProduction) {
      console.error('⚠️ El servidor iniciará pero las consultas a la BD fallarán');
    }
  }
})();

// 📦 Exportar el pool para usar en toda la app
module.exports = db;