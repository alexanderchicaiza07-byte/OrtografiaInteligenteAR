
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDatabase } from "./Config/database";
import authRoutes from "./Routes/authRoutes";
import adminRoutes from "./Routes/adminRoutes";
import temasRoutes from "./Routes/temasRoutes";
import leccionesRoutes from "./Routes/leccionesRoutes";
import preguntasRoutes from "./Routes/preguntasRoutes";
import evaluacionesRoutes from "./Routes/evaluacionRoutes";
import iaRoutes from "./Routes/iaRoutes";
import marcadoresRoutes from "./Routes/marcadoresAR";
// Variables de entorno
dotenv.config();

// Crear servidor
const app = express();
const PORT = process.env.PORT || 3045;

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/temas", temasRoutes);
app.use("/api/lecciones", leccionesRoutes);
app.use("/api/preguntas", preguntasRoutes);
app.use("/api/evaluaciones", evaluacionesRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/marcadores", marcadoresRoutes);
// Ruta principal
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API Ortografía Inteligente AR funcionando"
  });
});

// Conectar a SQL Server e iniciar servidor
async function iniciarServidor() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log("Servidor ejecutándose en el puerto " + PORT);
    });

  } catch (error) {
    console.log("Error al iniciar servidor:", error);
  }
}

iniciarServidor();
