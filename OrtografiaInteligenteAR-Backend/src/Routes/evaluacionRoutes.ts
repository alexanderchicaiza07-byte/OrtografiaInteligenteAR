
import { Router } from "express";

import {
  obtenerCuestionario,
  finalizarEvaluacion,
  obtenerMisResultados
} from "../Controllers/evaluacionController";

import { verificarToken } from "../Middlewares/authMiddlewares";

const router = Router();

// Todas las rutas requieren sesión
router.use(verificarToken);

// Obtener preguntas de evaluación
router.get("/tema/:id_tema", obtenerCuestionario);

// Finalizar y calificar
router.post("/finalizar", finalizarEvaluacion);

// Consultar resultados
router.get("/mis-resultados", obtenerMisResultados);

export default router;
