# 🧩 Community Payments Backend

Backend API desarrollada para una web e-comerse de venta de juegos de manera online.

---

## 🚀 Tecnologías utilizadas

- Node.js
- Express.js
- MySQL
- JWT (Autenticación)
- bcrypt (Encriptación de contraseñas)
- dotenv
- API REST

---

## Api de juegos
- RAWG

## 📂 Estructura del proyecto

src/
├── controllers/ # Lógica del negocio
├── routes/ # Rutas de la API
├── models/ # Modelos de base de datos
├── middlewares/ # Middlewares personalizados
└── app.js # Configuración de Express


---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=storegame
JWT_SECRET=tu_secreto