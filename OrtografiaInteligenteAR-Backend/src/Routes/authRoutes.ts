
import { Router } from "express";

import {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfil,
  recuperarClave,
  validarToken,
  restablecerClave
} from "../Controllers/authController";

import { verificarToken } from "../Middlewares/authMiddlewares";

const router = Router();

// Registro e inicio de sesión
router.post("/registro", registrarUsuario);
router.post("/login", iniciarSesion);

// Consultar perfil
router.get("/perfil", verificarToken, obtenerPerfil);

// Cerrar sesión
router.post("/logout", cerrarSesion);

// Recuperación de contraseña
router.post("/recuperar-clave", recuperarClave);
router.post("/validar-token", validarToken);
router.post("/restablecer-clave", restablecerClave);

export default router;
