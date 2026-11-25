
import { Request, Response } from "express";
import { QueryTypes } from "sequelize";

import { sequelize } from "../Config/database";
import Preguntas from "../Models/Preguntas";
import Opciones from "../Models/Opciones";
import Temas from "../Models/Temas";

// ======================================
// 1. CONSULTAR PREGUNTAS POR TEMA
// ======================================

export const obtenerPreguntasPorTema = async (
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

    // Verificar que el tema exista
    const tema = await Temas.findByPk(id_tema);

    if (!tema || (!tema.estado && usuario.rol !== "ADMIN")) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    // Consultar preguntas
    const preguntas = await Preguntas.findAll({
      where: usuario.rol === "ADMIN"
        ? { id_tema }
        : { id_tema, estado: true },
      order: [["id_pregunta", "ASC"]]
    });

    const resultado = [];

    // Buscar las opciones de cada pregunta
    for (const pregunta of preguntas) {

      const opciones = await Opciones.findAll({
        where: { id_pregunta: pregunta.id_pregunta },
        order: [["orden", "ASC"]]
      });

      // Los administradores ven las respuestas correctas
      if (usuario.rol === "ADMIN") {
        resultado.push({
          ...pregunta.toJSON(),
          opciones
        });
      } else {
        // Los estudiantes NO ven las respuestas correctas
        resultado.push({
          id_pregunta: pregunta.id_pregunta,
          id_tema: pregunta.id_tema,
          enunciado: pregunta.enunciado,
          opciones: opciones.map(opcion => ({
            id_opcion: opcion.id_opcion,
            texto: opcion.texto,
            orden: opcion.orden
          }))
        });
      }
    }

    res.status(200).json({
      ok: true,
      preguntas: resultado
    });

  } catch (error) {
    console.error("Error al consultar preguntas:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar preguntas"
    });
  }
};

// ======================================
// 2. CONSULTAR PREGUNTA POR ID
// ======================================

export const obtenerPreguntaPorId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const id = Number(req.params.id);
    const usuario = res.locals.usuario;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
      return;
    }

    const pregunta = await Preguntas.findByPk(id);

    if (!pregunta) {
      res.status(404).json({
        ok: false,
        mensaje: "Pregunta no encontrada"
      });
      return;
    }

    const tema = await Temas.findByPk(pregunta.id_tema);

    if (
      usuario.rol !== "ADMIN" &&
      (!pregunta.estado || !tema || !tema.estado)
    ) {
      res.status(404).json({
        ok: false,
        mensaje: "Pregunta no encontrada"
      });
      return;
    }

    const opciones = await Opciones.findAll({
      where: { id_pregunta: id },
      order: [["orden", "ASC"]]
    });

    if (usuario.rol === "ADMIN") {
      res.json({
        ok: true,
        pregunta,
        opciones
      });
    } else {
      res.json({
        ok: true,
        pregunta: {
          id_pregunta: pregunta.id_pregunta,
          id_tema: pregunta.id_tema,
          enunciado: pregunta.enunciado
        },
        opciones: opciones.map(opcion => ({
          id_opcion: opcion.id_opcion,
          texto: opcion.texto,
          orden: opcion.orden
        }))
      });
    }

  } catch (error) {
    console.error("Error al consultar pregunta:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar la pregunta"
    });
  }
};


// ======================================
// 3. CREAR PREGUNTA CON CUATRO OPCIONES
// ======================================

export const crearPregunta = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const {
      id_tema,
      enunciado,
      explicacion,
      opciones
    } = req.body;

    // Validar pregunta
    if (
      !Number.isInteger(id_tema) ||
      id_tema <= 0 ||
      typeof enunciado !== "string" ||
      !enunciado.trim() ||
      enunciado.length > 500
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos de pregunta inválidos"
      });
      return;
    }

    if (
      explicacion != null &&
      typeof explicacion !== "string"
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Explicación inválida"
      });
      return;
    }

    // Verificar cuatro opciones
    if (!Array.isArray(opciones) || opciones.length !== 4) {
      res.status(400).json({
        ok: false,
        mensaje: "Debe ingresar cuatro opciones"
      });
      return;
    }

    // Verificar los datos de cada opción
    let correctas = 0;

    for (const opcion of opciones) {

      if (
        !opcion ||
        typeof opcion.texto !== "string" ||
        !opcion.texto.trim() ||
        opcion.texto.length > 300 ||
        typeof opcion.es_correcta !== "boolean"
      ) {
        res.status(400).json({
          ok: false,
          mensaje: "Una de las opciones es inválida"
        });
        return;
      }

      if (opcion.es_correcta === true) {
        correctas++;
      }
    }

    if (correctas !== 1) {
      res.status(400).json({
        ok: false,
        mensaje: "Debe existir una sola respuesta correcta"
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

    // Guardar pregunta y opciones juntas
    const pregunta = await sequelize.transaction(
      async (transaction) => {

        const nuevaPregunta = await Preguntas.create({
          id_tema,
          enunciado: enunciado.trim(),
          explicacion: explicacion?.trim() || null,
          estado: true
        }, { transaction });

        for (let i = 0; i < opciones.length; i++) {

          await Opciones.create({
            id_pregunta: nuevaPregunta.id_pregunta,
            texto: opciones[i].texto.trim(),
            es_correcta: opciones[i].es_correcta,
            orden: i + 1
          }, { transaction });

        }

        return nuevaPregunta;
      }
    );

    res.status(201).json({
      ok: true,
      mensaje: "Pregunta registrada correctamente",
      pregunta
    });

  } catch (error) {
    console.error("Error al crear pregunta:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la pregunta"
    });
  }
};


// ======================================
// 4. ACTUALIZAR PREGUNTA Y OPCIONES
// ======================================

export const actualizarPregunta = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const id = Number(req.params.id);

    const {
      id_tema,
      enunciado,
      explicacion,
      opciones
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
      typeof enunciado !== "string" ||
      !enunciado.trim() ||
      enunciado.length > 500 ||
      (explicacion != null &&
       typeof explicacion !== "string")
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos"
      });
      return;
    }

    if (!Array.isArray(opciones) || opciones.length !== 4) {
      res.status(400).json({
        ok: false,
        mensaje: "Debe enviar cuatro opciones"
      });
      return;
    }

    let correctas = 0;
    const ids = new Set<number>();

    for (const opcion of opciones) {

      if (
        !opcion ||
        !Number.isInteger(opcion.id_opcion) ||
        opcion.id_opcion <= 0 ||
        typeof opcion.texto !== "string" ||
        !opcion.texto.trim() ||
        opcion.texto.length > 300 ||
        typeof opcion.es_correcta !== "boolean"
      ) {
        res.status(400).json({
          ok: false,
          mensaje: "Opciones inválidas"
        });
        return;
      }

      ids.add(opcion.id_opcion);

      if (opcion.es_correcta) {
        correctas++;
      }
    }

    if (correctas !== 1 || ids.size !== 4) {
      res.status(400).json({
        ok: false,
        mensaje: "Debe haber cuatro opciones distintas y una correcta"
      });
      return;
    }

    const tema = await Temas.findByPk(id_tema);
    const pregunta = await Preguntas.findByPk(id);

    if (!tema || !pregunta) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema o pregunta no encontrados"
      });
      return;
    }

    // No modificar preguntas que ya tengan respuestas
    const registros = await sequelize.query<{ total: number }>(
      "SELECT COUNT(*) AS total FROM Respuestas WHERE id_pregunta = :id",
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (registros[0].total > 0) {
      res.status(409).json({
        ok: false,
        mensaje: "No se puede editar una pregunta que ya fue respondida"
      });
      return;
    }

    // Verificar las opciones existentes
    const opcionesGuardadas = await Opciones.findAll({
      where: { id_pregunta: id }
    });

    if (
      opcionesGuardadas.length !== 4 ||
      !opcionesGuardadas.every(opcion =>
        ids.has(opcion.id_opcion)
      )
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Las opciones no corresponden a esta pregunta"
      });
      return;
    }

    // Actualizar todo dentro de una transacción
    await sequelize.transaction(async (transaction) => {

      await pregunta.update({
        id_tema,
        enunciado: enunciado.trim(),
        explicacion: explicacion?.trim() || null
      }, { transaction });

      for (let i = 0; i < opciones.length; i++) {

        await Opciones.update({
          texto: opciones[i].texto.trim(),
          es_correcta: opciones[i].es_correcta,
          orden: i + 1
        }, {
          where: {
            id_opcion: opciones[i].id_opcion,
            id_pregunta: id
          },
          transaction
        });

      }
    });

    res.json({
      ok: true,
      mensaje: "Pregunta actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar pregunta:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar la pregunta"
    });
  }
};

// ======================================
// 5. ACTIVAR O DESACTIVAR PREGUNTA
// ======================================

export const cambiarEstadoPregunta = async (
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

    const pregunta = await Preguntas.findByPk(id);

    if (!pregunta) {
      res.status(404).json({
        ok: false,
        mensaje: "Pregunta no encontrada"
      });
      return;
    }

    await pregunta.update({ estado });

    res.json({
      ok: true,
      mensaje: "Estado actualizado correctamente",
      pregunta
    });

  } catch (error) {
    console.error("Error al cambiar estado:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar estado"
    });
  }
};
