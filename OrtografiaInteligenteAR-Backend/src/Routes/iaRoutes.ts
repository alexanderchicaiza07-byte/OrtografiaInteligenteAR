
import { Router } from "express";

import { explicarErrores } from "../Controllers/iaController";
import { verificarToken } from "../Middlewares/authMiddlewares";

const router = Router();

// Verificar sesión
router.use(verificarToken);

// Explicar errores de una evaluación
router.post("/explicar/:id", explicarErrores);

export default router;
