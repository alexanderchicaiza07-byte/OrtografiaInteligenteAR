import { Request, Response, NextFunction } from "express";

export const verificarAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  const usuario = res.locals.usuario;

  // Verificar qué usuario llega al middleware
  console.log("Usuario:", usuario?.correo);
  console.log("Rol:", usuario?.rol);

  if (!usuario || usuario.rol !== "ADMIN") {
    res.status(403).json({
      ok: false,
      mensaje: "No tiene permisos de administrador"
    });
    return;
  }

  next();
};