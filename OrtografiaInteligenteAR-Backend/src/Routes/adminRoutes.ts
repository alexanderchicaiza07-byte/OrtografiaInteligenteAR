
import { Router } from "express";

import { verificarToken } from "../Middlewares/authMiddlewares";
import { verificarAdmin } from "../Middlewares/roleMiddlewares";
import { panelAdmin } from "../Controllers/adminController";

const router = Router();

// Verificar autenticación
router.use(verificarToken);

// Verificar rol administrador
router.use(verificarAdmin);

// Panel administrador
router.get("/", panelAdmin);

export default router;
