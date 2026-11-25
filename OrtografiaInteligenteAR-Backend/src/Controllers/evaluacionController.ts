
import { Request, Response } from "express";

import { sequelize } from "../Config/database";
import Temas from "../Models/Temas";
import Preguntas from "../Models/Preguntas";
import Opciones from "../Models/Opciones";
import Intentos from "../Models/Intentos";
import Respuestas from "../Models/Respuestas";

// =====================================
// 1. OBTENER CUESTIONARIO
// =====================================

export const obtenerCuestionario = async (
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

    // Buscar el tema
    const tema = await Temas.findByPk(id_tema);

    if (!tema || !tema.estado) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no encontrado"
      });
      return;
    }

    // Obtener las primeras cinco preguntas activas
    const preguntas = await Preguntas.findAll({
      where: {
        id_tema,
        estado: true
      },
      order: [["id_pregunta", "ASC"]],
      limit: 5
    });

    if (preguntas.length !== 5) {
      res.status(400).json({
        ok: false,
        mensaje: "El tema necesita cinco preguntas activas"
      });
      return;
    }

    const cuestionario = [];

    // Obtener las opciones de cada pregunta
    for (const pregunta of preguntas) {

      const opciones = await Opciones.findAll({
        where: {
          id_pregunta: pregunta.id_pregunta
        },
        order: [["orden", "ASC"]]
      });

      // Comprobar que esté completa
      if (
        opciones.length !== 4 ||
        opciones.filter(o => o.es_correcta).length !== 1
      ) {
        res.status(400).json({
          ok: false,
          mensaje: "Una pregunta está mal configurada"
        });
        return;
      }

      cuestionario.push({
        id_pregunta: pregunta.id_pregunta,
        enunciado: pregunta.enunciado,

        opciones: opciones.map(opcion => ({
          id_opcion: opcion.id_opcion,
          texto: opcion.texto
        }))
      });
    }

    res.status(200).json({
      ok: true,
      tema: tema.nombre,
      total_preguntas: 5,
      preguntas: cuestionario
    });

  } catch (error) {
    console.error("Error al obtener cuestionario:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener cuestionario"
    });
  }
};


// =====================================
// 2. FINALIZAR EVALUACIÓN
// =====================================

export const finalizarEvaluacion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id_tema, respuestas } = req.body;
    const usuario = res.locals.usuario;

    // Solo estudiantes
    if (usuario.rol !== "ESTUDIANTE") {
      res.status(403).json({
        ok: false,
        mensaje: "Esta evaluación es para estudiantes"
      });
      return;
    }

    // Validar información
    if (
      !Number.isInteger(id_tema) ||
      id_tema <= 0 ||
      !Array.isArray(respuestas) ||
      respuestas.length !== 5
    ) {
      res.status(400).json({
        ok: false,
        mensaje: "Debe enviar cinco respuestas"
      });
      return;
    }

    // Validar formato de respuestas
    for (const respuesta of respuestas) {
      if (
        !respuesta ||
        !Number.isInteger(respuesta.id_pregunta) ||
        !Number.isInteger(respuesta.id_opcion)
      ) {
        res.status(400).json({
          ok: false,
          mensaje: "Formato de respuestas inválido"
        });
        return;
      }
    }

    // Verificar tema
    const tema = await Temas.findByPk(id_tema);

    if (!tema || !tema.estado) {
      res.status(404).json({
        ok: false,
        mensaje: "Tema no disponible"
      });
      return;
    }

    // Obtener las preguntas que forman la evaluación
    const preguntas = await Preguntas.findAll({
      where: {
        id_tema,
        estado: true
      },
      order: [["id_pregunta", "ASC"]],
      limit: 5
    });

    if (preguntas.length !== 5) {
      res.status(400).json({
        ok: false,
        mensaje: "El cuestionario está incompleto"
      });
      return;
    }

    
let correctas = 0;

const detalle: {
  id_pregunta: number;
  id_opcion: number;
  es_correcta: boolean;
  explicacion: string | null;
}[] = [];


    // Revisar cada pregunta
    for (const pregunta of preguntas) {

      const enviadas = respuestas.filter(
        r => r.id_pregunta === pregunta.id_pregunta
      );

      // Debe existir exactamente una respuesta
      if (enviadas.length !== 1) {
        res.status(400).json({
          ok: false,
          mensaje: "Las preguntas enviadas no son válidas"
        });
        return;
      }

      const opciones = await Opciones.findAll({
        where: { id_pregunta: pregunta.id_pregunta }
      });

      if (
        opciones.length !== 4 ||
        opciones.filter(o => o.es_correcta).length !== 1
      ) {
        res.status(400).json({
          ok: false,
          mensaje: "Una pregunta está mal configurada"
        });
        return;
      }

      const seleccionada = opciones.find(
        o => o.id_opcion === enviadas[0].id_opcion
      );

      if (!seleccionada) {
        res.status(400).json({
          ok: false,
          mensaje: "Una opción no pertenece a su pregunta"
        });
        return;
      }

      if (seleccionada.es_correcta) {
        correctas++;
      }

      // Guardar temporalmente el resultado
      detalle.push({
        id_pregunta: pregunta.id_pregunta,
        id_opcion: seleccionada.id_opcion,
        es_correcta: seleccionada.es_correcta,
        explicacion: pregunta.explicacion
      });
    }

    // Calcular nota de 0 a 100
    const puntaje = (correctas / 5) * 100;
    const fecha = new Date();

    // Guardar intento y respuestas en una transacción
    const intento = await sequelize.transaction(
      async (transaction) => {

        const nuevoIntento = await Intentos.create({
          id_usuario: usuario.id_usuario,
          id_tema,
          fecha_inicio: fecha,
          fecha_fin: fecha,
          total_preguntas: 5,
          respuestas_correctas: correctas,
          puntaje,
          estado: "FINALIZADO"
        }, { transaction });

        // Guardar cada respuesta
        for (const respuesta of detalle) {

          await Respuestas.create({
            id_intento: nuevoIntento.id_intento,
            id_pregunta: respuesta.id_pregunta,
            id_opcion: respuesta.id_opcion,
            es_correcta: respuesta.es_correcta,
            fecha_respuesta: fecha
          }, { transaction });

        }

        return nuevoIntento;
      }
    );

    res.status(201).json({
      ok: true,
      mensaje: "Evaluación finalizada correctamente",
      id_intento: intento.id_intento,
      total_preguntas: 5,
      respuestas_correctas: correctas,
      puntaje,
      aprobado: puntaje >= 80,
      detalle
    });

  } catch (error) {
    console.error("Error al finalizar evaluación:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al finalizar evaluación"
    });
  }
};

// ======================================
// 3. CONSULTAR MIS RESULTADOS
// ======================================

export const obtenerMisResultados = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    // 1. Obtener usuario de la sesión
    const usuario = res.locals.usuario;

    // 2. Buscar evaluaciones del estudiante
    const resultados = await Intentos.findAll({
      where: {
        id_usuario: usuario.id_usuario,
        estado: "FINALIZADO"
      },
      order: [["fecha_fin", "DESC"]]
    });

    // 3. Enviar resultados
    res.status(200).json({
      ok: true,
      mensaje: "Resultados obtenidos correctamente",
      total: resultados.length,
      resultados: resultados
    });

  } catch (error) {

    console.error("Error al consultar resultados:", error);

    res.status(500).json({
      ok: false,
      mensaje: "Error al consultar los resultados"
    });

  }
};
