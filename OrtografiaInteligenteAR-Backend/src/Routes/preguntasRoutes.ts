
import { Router } from "express";

import {
  obtenerPreguntasPorTema,
  obtenerPreguntaPorId,
  crearPregunta,
  actualizarPregunta,
  cambiarEstadoPregunta
} from "../Controllers/preguntasController";

import { verificarToken } from "../Middlewares/authMiddlewares";
import { verificarAdmin } from "../Middlewares/roleMiddlewares";

const router = Router();

// Todas las rutas requieren sesión
router.use(verificarToken);

// Consultas
router.get("/tema/:id_tema", obtenerPreguntasPorTema);
router.get("/:id", obtenerPreguntaPorId);

// Solo administrador
router.post("/", verificarAdmin, crearPregunta);
router.put("/:id", verificarAdmin, actualizarPregunta);
router.patch("/:id/estado", verificarAdmin, cambiarEstadoPregunta);

export default router;
