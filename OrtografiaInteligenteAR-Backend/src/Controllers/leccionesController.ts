
import { Request, Response } from "express";
import Lecciones from "../Models/Lecciones";
import Temas from "../Models/Temas";

// =====================================
// 1. CONSULTAR LECCIONES
// =====================================

export const obtenerLecciones = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usuario = res.locals.usuario;

    const lecciones = await Lecciones.findAll({
      where: usuario.rol === "ADMIN"
        ? {}
        : { estado: true },
      order: [["orden", "ASC"]]
    });

    res.json({
      ok: true,
      lecciones
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar lecciones"
    });
  }
};

// =====================================
// 2. CONSULTAR LECCIONES POR TEMA
// =====================================

export const obtenerLeccionesPorTema = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id_tema = Number(req.params.id_tema);

    if (!Number.isInteger(id_tema) || id_tema <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID de tema inválido"
      });
      return;
    }

    const usuario = res.locals.usuario;

    const tema = await Temas.findByPk(id_tema);

    if (!tema || (!tema.estado && usuario.rol !== "ADMIN")) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    const lecciones = await Lecciones.findAll({
      where: usuario.rol === "ADMIN"
        ? { id_tema }
        : { id_tema, estado: true },
      order: [["orden", "ASC"]]
    });

    res.json({
      ok: true,
      lecciones
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar lecciones del tema"
    });
  }
};

// =====================================
// 3. REGISTRAR LECCIÓN
// =====================================

export const crearLeccion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      id_tema,
      titulo,
      contenido,
      ejemplos,
      orden
    } = req.body;

    if (
      !Number.isInteger(id_tema) ||
      id_tema <= 0 ||
      typeof titulo !== "string" ||
      !titulo.trim() ||
      titulo.length > 150 ||
      typeof contenido !== "string" ||
      !contenido.trim() ||
      !Number.isInteger(orden) ||
      orden <= 0
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos de la lección inválidos"
      });
      return;
    }

    if (
      ejemplos !== undefined &&
      ejemplos !== null &&
      typeof ejemplos !== "string"
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Ejemplos inválidos"
      });
      return;
    }

    const tema = await Temas.findByPk(id_tema);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "El tema no existe"
      });
      return;
    }

    const nuevaLeccion = await Lecciones.create({
      id_tema,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      ejemplos: ejemplos?.trim() || null,
      orden,
      estado: true
    });

    res.status(201).json({
      ok: true,
      mensaje: "Lección registrada correctamente",
      leccion: nuevaLeccion
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al registrar lección"
    });
  }
};

// =====================================
// 4. ACTUALIZAR LECCIÓN
// =====================================

export const actualizarLeccion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const {
      id_tema,
      titulo,
      contenido,
      ejemplos,
      orden
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
      return;
    }

    const leccion = await Lecciones.findByPk(id);

    if (!leccion) {
      res.status(404).json({
        ok: false,
        mensaje: "Lección no encontrada"
      });
      return;
    }

    if (
      !Number.isInteger(id_tema) ||
      id_tema <= 0 ||
      typeof titulo !== "string" ||
      !titulo.trim() ||
      titulo.length > 150 ||
      typeof contenido !== "string" ||
      !contenido.trim() ||
      !Number.isInteger(orden) ||
      orden <= 0 ||
      (
        ejemplos !== undefined &&
        ejemplos !== null &&
        typeof ejemplos !== "string"
      )
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos"
      });
      return;
    }

    const tema = await Temas.findByPk(id_tema);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "El tema no existe"
      });
      return;
    }

    await leccion.update({
      id_tema,
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      ejemplos: ejemplos?.trim() || null,
      orden
    });

    res.json({
      ok: true,
      mensaje: "Lección actualizada correctamente",
      leccion
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar lección"
    });
  }
};

// =====================================
// 5. CAMBIAR ESTADO
// =====================================

export const cambiarEstadoLeccion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof estado !== "boolean"
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "ID o estado inválido"
      });
      return;
    }

    const leccion = await Lecciones.findByPk(id);

    if (!leccion) {
      res.status(404).json({
        ok: false,
        mensaje: "Lección no encontrada"
      });
      return;
    }

    await leccion.update({ estado });

    res.json({
      ok: true,
      mensaje: "Estado actualizado correctamente",
      leccion
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar estado"
    });
  }
};
