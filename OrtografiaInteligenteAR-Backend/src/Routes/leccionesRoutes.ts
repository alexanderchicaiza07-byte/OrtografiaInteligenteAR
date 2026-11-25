
import { Router } from "express";

import {
  obtenerLecciones,
  obtenerLeccionesPorTema,
  crearLeccion,
  actualizarLeccion,
  cambiarEstadoLeccion
} from "../Controllers/leccionesController";

import { verificarToken } from "../Middlewares/authMiddlewares";
import { verificarAdmin } from "../Middlewares/roleMiddlewares";

const router = Router();

// Todas las rutas necesitan sesión
router.use(verificarToken);

// Consultar lecciones
router.get("/", obtenerLecciones);

// Consultar lecciones de un tema
router.get("/tema/:id_tema", obtenerLeccionesPorTema);

// Solo administrador
router.post("/", verificarAdmin, crearLeccion);
router.put("/:id", verificarAdmin, actualizarLeccion);
router.patch("/:id/estado", verificarAdmin, cambiarEstadoLeccion);

export default router;
