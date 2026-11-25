
import { Request, Response } from "express";

export const panelAdmin = (
  req: Request,
  res: Response
): void => {

  const usuario = res.locals.usuario;

  res.status(200).json({
    ok: true,
    mensaje: "Bienvenido al panel de administrador",
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      rol: usuario.rol
    }
  });
};
