
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// ======================================
// CONEXIÓN CON SQL SERVER - SOMEE
// ======================================

export const sequelize = new Sequelize(
  process.env.DB_NAME || "",
  process.env.DB_USER || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1433),

    dialect: "mssql",

    
dialectOptions: {
  options: {
    encrypt: true,
    trustServerCertificate: false,
    serverName: "vj2200.mgmt.somee.com"
  }
}
,

    logging: false
  }
);

console.log("Servidor SQL:", process.env.DB_HOST);
console.log("Base de datos:", process.env.DB_NAME);
console.log("Usuario SQL:", process.env.DB_USER);
console.log("Contraseña configurada:", Boolean(process.env.DB_PASSWORD));
// ======================================
// PROBAR CONEXIÓN
// ======================================

export const connectDatabase = async () => {
  try {

    await sequelize.authenticate();

    console.log("Conexión con SQL Server de Somee exitosa");
    console.log("Base de datos:", process.env.DB_NAME);

  } catch (error) {

    console.error("Error al conectar con Somee:", error);
    throw error;

  }
};
