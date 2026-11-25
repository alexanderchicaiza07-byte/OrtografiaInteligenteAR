
import { Router } from "express";

import {
  obtenerTemas,
  obtenerTemaPorId,
  crearTema,
  actualizarTema,
  cambiarEstadoTema
} from "../Controllers/temasController";

import { verificarToken } from "../Middlewares/authMiddlewares";
import { verificarAdmin } from "../Middlewares/roleMiddlewares";

const router = Router();

// Todas las rutas requieren iniciar sesión
router.use(verificarToken);

// Consultar temas
router.get("/", obtenerTemas);
router.get("/:id", obtenerTemaPorId);

// Solo administrador
router.post("/", verificarAdmin, crearTema);
router.put("/:id", verificarAdmin, actualizarTema);
router.patch("/:id/estado", verificarAdmin, cambiarEstadoTema);

export default router;
