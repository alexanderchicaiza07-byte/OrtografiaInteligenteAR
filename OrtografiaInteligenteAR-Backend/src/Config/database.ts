
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

if (!dbName || !dbUser || !dbPassword) {
  throw new Error(
    "Faltan las variables DB_NAME, DB_USER o DB_PASSWORD"
  );
}

export const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 1433),
    dialect: "mssql",

    logging: false,

    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate:
          process.env.DB_TRUST_CERT === "true",
      },
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    console.log("Conexión con SQL Server exitosa");
    console.log(`Base de datos: ${dbName}`);
  } catch (error) {
    console.error("Error al conectar con SQL Server:", error);
    throw error;
  }
};
