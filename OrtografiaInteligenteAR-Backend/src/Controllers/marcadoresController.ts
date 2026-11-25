
import { Request, Response } from "express";

import MarcadoresAR from "../Models/MarcadoresAR";
import Temas from "../Models/Temas";

// =====================================
// 1. CONSULTAR MARCADORES
// =====================================

export const obtenerMarcadores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const usuario = res.locals.usuario;

    const marcadores = await MarcadoresAR.findAll({
      where: usuario.rol === "ADMIN"
        ? {}
        : { estado: true },
      order: [["id_marcador", "ASC"]]
    });

    // No mostrar marcadores de temas inactivos
    // a los estudiantes.
    const resultado = [];

    for (const marcador of marcadores) {
      const tema = await Temas.findByPk(marcador.id_tema);

      if (
        usuario.rol === "ADMIN" ||
        (tema && tema.estado)
      ) {
        resultado.push(marcador);
      }
    }

    res.status(200).json({
      ok: true,
      marcadores: resultado
    });

  } catch (error) {
    console.error("Error al consultar marcadores:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar marcadores"
    });
  }
};

// =====================================
// 2. CONSULTAR MARCADORES POR TEMA
// =====================================

export const obtenerMarcadoresPorTema = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const id_tema = Number(req.params.id_tema);
    const usuario = res.locals.usuario;

    if (!Number.isInteger(id_tema) || id_tema <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID de tema inválido"
      });
      return;
    }

    const tema = await Temas.findByPk(id_tema);

    if (!tema || (!tema.estado && usuario.rol !== "ADMIN")) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    const marcadores = await MarcadoresAR.findAll({
      where: usuario.rol === "ADMIN"
        ? { id_tema }
        : { id_tema, estado: true }
    });

    res.status(200).json({
      ok: true,
      marcadores
    });

  } catch (error) {
    console.error("Error al consultar marcadores:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar marcadores del tema"
    });
  }
};


// =====================================
// 3. CREAR MARCADOR
// =====================================

export const crearMarcador = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const {
      id_tema,
      nombre,
      archivo_marcador,
      contenido_ar
    } = req.body;

    // Validar campos
    if (
      !Number.isInteger(id_tema) ||
      id_tema <= 0 ||
      typeof nombre !== "string" ||
      !nombre.trim() ||
      nombre.length > 100 ||
      typeof archivo_marcador !== "string" ||
      !/^\/assets\/ar\/[a-zA-Z0-9_-]+\.patt$/.test(archivo_marcador) ||
      typeof contenido_ar !== "string" ||
      !contenido_ar.trim()
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos del marcador inválidos"
      });
      return;
    }

    // Comprobar que existe el tema
    const tema = await Temas.findByPk(id_tema);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "El tema no existe"
      });
      return;
    }

    // Guardar marcador
    const marcador = await MarcadoresAR.create({
      id_tema,
      nombre: nombre.trim(),
      archivo_marcador,
      contenido_ar: contenido_ar.trim(),
      estado: true
    });

    res.status(201).json({
      ok: true,
      mensaje: "Marcador registrado correctamente",
      marcador
    });

  } catch (error) {
    console.error("Error al registrar marcador:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al registrar marcador"
    });
  }
};

// =====================================
// 4. ACTUALIZAR MARCADOR
// =====================================

export const actualizarMarcador = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const id = Number(req.params.id);

    const {
      id_tema,
      nombre,
      archivo_marcador,
      contenido_ar
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
      return;
    }

    // Validar datos
    if (
      !Number.isInteger(id_tema) ||
      id_tema <= 0 ||
      typeof nombre !== "string" ||
      !nombre.trim() ||
      nombre.length > 100 ||
      typeof archivo_marcador !== "string" ||
      !/^\/assets\/ar\/[a-zA-Z0-9_-]+\.patt$/.test(archivo_marcador) ||
      typeof contenido_ar !== "string" ||
      !contenido_ar.trim()
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos"
      });
      return;
    }

    // Buscar marcador
    const marcador = await MarcadoresAR.findByPk(id);

    if (!marcador) {
      res.status(404).json({
        ok: false,
        mensaje: "Marcador no encontrado"
      });
      return;
    }

    // Verificar tema
    const tema = await Temas.findByPk(id_tema);

    if (!tema) {
      res.status(404).json({
        ok: false,
        mensaje: "El tema no existe"
      });
      return;
    }

    // Actualizar
    await marcador.update({
      id_tema,
      nombre: nombre.trim(),
      archivo_marcador,
      contenido_ar: contenido_ar.trim()
    });

    res.status(200).json({
      ok: true,
      mensaje: "Marcador actualizado correctamente",
      marcador
    });

  } catch (error) {
    console.error("Error al actualizar marcador:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar marcador"
    });
  }
};

// =====================================
// 5. CAMBIAR ESTADO DEL MARCADOR
// =====================================

export const cambiarEstadoMarcador = async (
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

    const marcador = await MarcadoresAR.findByPk(id);

    if (!marcador) {
      res.status(404).json({
        ok: false,
        mensaje: "Marcador no encontrado"
      });
      return;
    }

    await marcador.update({ estado });

    res.status(200).json({
      ok: true,
      mensaje: "Estado actualizado correctamente",
      marcador
    });

  } catch (error) {
    console.error("Error al cambiar estado:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar estado del marcador"
    });
  }
};
