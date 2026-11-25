
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Usuario from "../Models/Usuarios";

export const verificarToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    // Obtener token de la cookie
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        ok: false,
        mensaje: "Debe iniciar sesión"
      });
      return;
    }

    // Obtener clave JWT
    const clave = process.env.JWT_SECRET;

    if (!clave) {
      throw new Error("JWT_SECRET no configurado");
    }

    // Verificar token
    const datos = jwt.verify(token, clave);

    if (typeof datos === "string" || !datos.id_usuario) {
      res.status(401).json({
        ok: false,
        mensaje: "Token inválido"
      });
      return;
    }

    // Buscar usuario
    const usuario = await Usuario.findByPk(datos.id_usuario);

    if (!usuario || !usuario.estado) {
      res.status(401).json({
        ok: false,
        mensaje: "Usuario no autorizado"
      });
      return;
    }

    // Guardar usuario
    res.locals.usuario = usuario;

    next();

  } catch (error) {

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        ok: false,
        mensaje: "Token inválido o expirado"
      });
      return;
    }

    console.error("Error de autenticación:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al verificar la sesión"
    });
  }
};
