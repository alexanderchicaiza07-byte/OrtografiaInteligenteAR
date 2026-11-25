
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// ======================================
// BASE DE DATOS
// ======================================

import { connectDatabase } from "./Config/database";

// ======================================
// RUTAS
// ======================================

import authRoutes from "./Routes/authRoutes";
import adminRoutes from "./Routes/adminRoutes";
import temasRoutes from "./Routes/temasRoutes";
import leccionesRoutes from "./Routes/leccionesRoutes";
import preguntasRoutes from "./Routes/preguntasRoutes";
import evaluacionesRoutes from "./Routes/evaluacionRoutes";
import iaRoutes from "./Routes/iaRoutes";
import marcadoresRoutes from "./Routes/marcadoresAR";

// ======================================
// VARIABLES DE ENTORNO
// ======================================

dotenv.config();

// ======================================
// CREAR SERVIDOR
// ======================================

const app = express();

const PORT = Number(process.env.PORT) || 3045;

// ======================================
// CONFIGURACIÓN CORS
// ======================================

// Dirección del frontend en desarrollo
const frontendLocal = "http://localhost:5173";

// Dirección pública de Vercel
const frontendProduccion = process.env.FRONTEND_URL;

// Direcciones autorizadas

// ======================================
// CONFIGURACIÓN CORS
// ======================================


 // ======================================
 // CONFIGURACIÓN CORS
 // ======================================

const origenesPermitidos = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter((origen): origen is string => Boolean(origen));

app.use(
  cors({
    origin: (origin, callback) => {

      // Permitir solicitudes sin origen,
      // como Postman o aplicaciones de servidor
      if (!origin) {
        return callback(null, true);
      }

      // Permitir únicamente los dominios configurados
      if (origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }

      console.log("Origen CORS rechazado:", origin);

      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.use(
  cors({
    origin: (origin, callback) => {

      // Permitir solicitudes sin Origin
      // como Postman o algunas solicitudes de servidor
      if (!origin) {
        return callback(null, true);
      }

      if (origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }

      console.log("Origen CORS rechazado:", origin);

      return callback(new Error("Origen no permitido por CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);


// ======================================
// MIDDLEWARES
// ======================================

app.use(express.json());

app.use(cookieParser());

// ======================================
// RUTAS DE AUTENTICACIÓN
// ======================================

app.use("/api/auth", authRoutes);

// ======================================
// RUTAS DEL ADMINISTRADOR
// ======================================

app.use("/api/admin", adminRoutes);

// ======================================
// RUTAS EDUCATIVAS
// ======================================

app.use("/api/temas", temasRoutes);

app.use("/api/lecciones", leccionesRoutes);

app.use("/api/preguntas", preguntasRoutes);

// ======================================
// EVALUACIONES Y RESULTADOS
// ======================================

app.use("/api/evaluaciones", evaluacionesRoutes);

// ======================================
// INTELIGENCIA ARTIFICIAL
// ======================================

app.use("/api/ia", iaRoutes);

// ======================================
// REALIDAD AUMENTADA
// ======================================

app.use("/api/marcadores", marcadoresRoutes);

// ======================================
// RUTA PRINCIPAL
// ======================================

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API Ortografía Inteligente AR funcionando"
  });
});

// ======================================
// RUTA DE VERIFICACIÓN
// ======================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Backend activo",
    entorno: process.env.NODE_ENV || "development"
  });
});

// ======================================
// INICIAR SERVIDOR
// ======================================

async function iniciarServidor() {
  try {

    // Conectar a SQL Server de Somee
    await connectDatabase();

    // Iniciar Express
    app.listen(PORT, "0.0.0.0", () => {

      console.log(
        "Servidor ejecutándose en el puerto " + PORT
      );

    });

  } catch (error) {

    console.error(
      "Error al iniciar servidor:",
      error
    );

    process.exit(1);

  }
}

iniciarServidor();
