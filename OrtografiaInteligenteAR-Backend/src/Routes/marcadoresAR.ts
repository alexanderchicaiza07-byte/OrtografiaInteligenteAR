
import { Router } from "express";

import {
  obtenerMarcadores,
  obtenerMarcadoresPorTema,
  crearMarcador,
  actualizarMarcador,
  cambiarEstadoMarcador
} from "../Controllers/marcadoresController";

import { verificarToken } from "../Middlewares/authMiddlewares";
import { verificarAdmin } from "../Middlewares/roleMiddlewares";

const router = Router();

// Todas las rutas requieren sesión
router.use(verificarToken);

// Consultas
router.get("/", obtenerMarcadores);
router.get("/tema/:id_tema", obtenerMarcadoresPorTema);

// Solo administradores
router.post("/", verificarAdmin, crearMarcador);
router.put("/:id", verificarAdmin, actualizarMarcador);
router.patch("/:id/estado", verificarAdmin, cambiarEstadoMarcador);

export default router;
