
import { Request, Response } from "express";
import Temas from "../Models/Temas";

// =====================================
// 1. CONSULTAR TODOS LOS TEMAS
// =====================================

export const obtenerTemas = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuario = res.locals.usuario;

    // Los administradores ven todos los temas.
    // Los estudiantes solamente ven los activos.
    const temas = await Temas.findAll({
      where: usuario.rol === "ADMIN"
        ? {}
        : { estado: true },
      order: [["orden", "ASC"]]
    });

    res.status(200).json({
      ok: true,
      temas
    });

  } catch (error) {
    console.error("Error al consultar temas:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar los temas"
    });
  }
};

// =====================================
// 2. CONSULTAR UN TEMA POR ID
// =====================================

export const obtenerTemaPorId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
      return;
    }

    const tema = await Temas.findByPk(id);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    // No mostrar temas desactivados a estudiantes
    const usuario = res.locals.usuario;

    if (!tema.estado && usuario.rol !== "ADMIN") {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    res.status(200).json({
      ok: true,
      tema
    });

  } catch (error) {
    console.error("Error al consultar tema:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar el tema"
    });
  }
};

// =====================================
// 3. REGISTRAR UN TEMA
// =====================================

export const crearTema = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nombre, descripcion, orden } = req.body;

    // Validar información
    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      !Number.isInteger(orden) ||
      orden <= 0
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Ingrese nombre y orden válido"
      });
      return;
    }

    if (
      descripcion !== undefined &&
      descripcion !== null &&
      typeof descripcion !== "string"
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Descripción inválida"
      });
      return;
    }

    if (nombre.trim().length > 100 ||
        (descripcion && descripcion.length > 500)) {
      res.status(400).json({
        ok: false,
        mensaje: "Nombre o descripción demasiado largos"
      });
      return;
    }

    // Crear tema en SQL Server
    const nuevoTema = await Temas.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      orden,
      estado: true
    });

    res.status(201).json({
      ok: true,
      mensaje: "Tema registrado correctamente",
      tema: nuevoTema
    });

  } catch (error) {
    console.error("Error al crear tema:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al registrar el tema"
    });
  }
};

// =====================================
// 4. ACTUALIZAR UN TEMA
// =====================================

export const actualizarTema = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion, orden } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
      return;
    }

    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      !Number.isInteger(orden) ||
      orden <= 0 ||
      (
        descripcion !== undefined &&
        descripcion !== null &&
        typeof descripcion !== "string"
      )
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos"
      });
      return;
    }

    if (nombre.trim().length > 100 ||
        (descripcion && descripcion.length > 500)) {
      res.status(400).json({
        ok: false,
        mensaje: "Nombre o descripción demasiado largos"
      });
      return;
    }

    // Buscar tema
    const tema = await Temas.findByPk(id);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    // Actualizar
    await tema.update({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      orden
    });

    res.status(200).json({
      ok: true,
      mensaje: "Tema actualizado correctamente",
      tema
    });

  } catch (error) {
    console.error("Error al actualizar tema:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar el tema"
    });
  }
};

// =====================================
// 5. ACTIVAR O DESACTIVAR TEMA
// =====================================

export const cambiarEstadoTema = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
      return;
    }

    if (typeof estado !== "boolean") {
      res.status(400).json({
        ok: false,
        mensaje: "El estado debe ser true o false"
      });
      return;
    }

    const tema = await Temas.findByPk(id);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    await tema.update({ estado });

    res.status(200).json({
      ok: true,
      mensaje: "Estado actualizado correctamente",
      tema
    });

  } catch (error) {
    console.error("Error al cambiar estado:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar estado del tema"
    });
  }
};
