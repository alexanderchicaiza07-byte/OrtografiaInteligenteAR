
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardList
} from "lucide-react";
import axios from "axios";
import api from "../services/api";

interface Tema {
  id_tema: number;
  nombre: string;
}

interface Opcion {
  id_opcion: number;
  texto: string;
}

interface Pregunta {
  id_pregunta: number;
  enunciado: string;
  opciones: Opcion[];
}

interface Resultado {
  id_intento: number;
  puntaje: number;
  respuestas_correctas: number;
  total_preguntas: number;
  aprobado: boolean;
}

function Cuestionarios() {

  const navigate = useNavigate();
  const { id_tema } = useParams();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});

  const [actual, setActual] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // CONSULTAR LOS TEMAS
  useEffect(() => {

    if (id_tema) return;

    const cargarTemas = async () => {
      try {
        setCargando(true);

        const respuesta = await api.get("/temas");
        setTemas(respuesta.data.temas || []);

      } catch {
        setError("No se pudieron cargar los temas");
      } finally {
        setCargando(false);
      }
    };

    cargarTemas();

  }, [id_tema]);

  // CONSULTAR CUESTIONARIO
  useEffect(() => {

    if (!id_tema) return;

    const cargarCuestionario = async () => {
      try {

        setCargando(true);
        setError("");
        setResultado(null);
        setRespuestas({});
        setActual(0);
        setPreguntas([]);

        const respuesta = await api.get(
          `/evaluaciones/tema/${id_tema}`
        );

        setPreguntas(respuesta.data.preguntas || []);
        setTitulo(respuesta.data.tema || "Cuestionario");

      } catch (error) {

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.mensaje ||
            "No se pudo cargar el cuestionario"
          );
        } else {
          setError("Error al cargar el cuestionario");
        }

      } finally {
        setCargando(false);
      }
    };

    cargarCuestionario();

  }, [id_tema]);

  // SELECCIONAR RESPUESTA
  const seleccionar = (id_pregunta: number, id_opcion: number) => {

    setRespuestas({
      ...respuestas,
      [id_pregunta]: id_opcion
    });

  };

  // FINALIZAR EVALUACIÓN
  const finalizar = async () => {

    if (!id_tema || preguntas.length !== 5) return;

    if (Object.keys(respuestas).length !== preguntas.length) {
      setError("Debes responder todas las preguntas");
      return;
    }

    try {

      setCargando(true);
      setError("");

      const datos = preguntas.map(pregunta => ({
        id_pregunta: pregunta.id_pregunta,
        id_opcion: respuestas[pregunta.id_pregunta]
      }));

      const respuesta = await api.post(
        "/evaluaciones/finalizar",
        {
          id_tema: Number(id_tema),
          respuestas: datos
        }
      );

      setResultado(respuesta.data);

    } catch (error) {

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo finalizar la evaluación"
        );
      } else {
        setError("Error al finalizar evaluación");
      }

    } finally {
      setCargando(false);
    }
  };

  // SELECCIONAR TEMA
  if (!id_tema) {
    return (
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-blue-950 mb-2">
          Cuestionarios
        </h1>

        <p className="text-gray-500 mb-7">
          Selecciona un tema para evaluar tus conocimientos.
        </p>

        {error && (
          <p className="text-red-600 mb-5">{error}</p>
        )}

        {cargando && <p>Cargando temas...</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {temas.map(tema => (

            <button
              key={tema.id_tema}
              onClick={() => navigate(
                `/estudiante/cuestionarios/${tema.id_tema}`
              )}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left hover:shadow-md cursor-pointer"
            >

              <ClipboardList
                size={35}
                className="text-blue-700 mb-4"
              />

              <h2 className="font-bold text-lg text-blue-950">
                {tema.nombre}
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Responde cinco preguntas de ortografía.
              </p>

              <span className="text-blue-700 font-semibold flex items-center gap-2 mt-5">
                Comenzar <ArrowRight size={18} />
              </span>

            </button>

          ))}

        </div>
      </div>
    );
  }

  // RESULTADO FINAL
  if (resultado) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

        <CheckCircle
          size={60}
          className="text-green-600 mx-auto mb-5"
        />

        <h1 className="text-2xl font-bold text-blue-950">
          Evaluación finalizada
        </h1>

        <p className="text-gray-500 mt-2">{titulo}</p>

        <h2 className="text-5xl font-bold text-blue-700 my-7">
          {Number(resultado.puntaje).toFixed(0)}%
        </h2>

        <p className="text-gray-600">
          Respuestas correctas:{" "}
          {resultado.respuestas_correctas} de{" "}
          {resultado.total_preguntas}
        </p>

        <p className={`font-semibold mt-3 ${
          resultado.aprobado ? "text-green-600" : "text-orange-600"
        }`}>
          {resultado.aprobado
            ? "¡Evaluación aprobada!"
            : "Continúa practicando"}
        </p>

        <button
          onClick={() => navigate("/estudiante/resultados")}
          className="w-full bg-blue-700 text-white py-3 rounded-xl mt-7 cursor-pointer"
        >
          Ver mis resultados
        </button>

        <button
          onClick={() => navigate(
            `/estudiante/asistente-ia/${resultado.id_intento}`
          )}
          className="w-full border border-blue-700 text-blue-700 py-3 rounded-xl mt-3 cursor-pointer"
        >
          Obtener explicación con IA
        </button>

      </div>
    );
  }

  const pregunta = preguntas[actual];

  return (
    <div className="max-w-3xl mx-auto">

      <button
        onClick={() => navigate("/estudiante/cuestionarios")}
        className="flex items-center gap-2 text-blue-700 mb-6 cursor-pointer"
      >
        <ArrowLeft size={18} />
        Volver a cuestionarios
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-bold text-blue-950">
            {titulo}
          </h1>

          <BookOpen className="text-blue-700" />
        </div>

        {error && (
          <p className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {cargando && !pregunta && (
          <p>Cargando cuestionario...</p>
        )}

        {pregunta && (
          <>
            <p className="text-blue-700 font-semibold mb-3">
              Pregunta {actual + 1} de {preguntas.length}
            </p>

            <div className="w-full h-2 bg-gray-100 rounded-full mb-7">
              <div
                className="bg-blue-700 h-2 rounded-full"
                style={{
                  width: `${((actual + 1) / preguntas.length) * 100}%`
                }}
              />
            </div>

            <h2 className="text-xl font-bold text-blue-950 mb-7">
              {pregunta.enunciado}
            </h2>

            <div className="space-y-3">

              {pregunta.opciones.map(opcion => (

                <button
                  key={opcion.id_opcion}
                  onClick={() => seleccionar(
                    pregunta.id_pregunta,
                    opcion.id_opcion
                  )}
                  className={`w-full text-left border p-4 rounded-xl cursor-pointer transition ${
                    respuestas[pregunta.id_pregunta] === opcion.id_opcion
                      ? "bg-blue-100 border-blue-700 text-blue-950"
                      : "border-gray-200 hover:bg-blue-50"
                  }`}
                >
                  {opcion.texto}
                </button>

              ))}

            </div>

            <div className="flex justify-between mt-8 gap-3">

              <button
                disabled={actual === 0}
                onClick={() => setActual(actual - 1)}
                className="px-5 py-3 border rounded-xl disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>

              {actual < preguntas.length - 1 ? (

                <button
                  onClick={() => setActual(actual + 1)}
                  disabled={!respuestas[pregunta.id_pregunta]}
                  className="bg-blue-700 text-white px-6 py-3 rounded-xl disabled:opacity-40 cursor-pointer flex items-center gap-2"
                >
                  Siguiente <ArrowRight size={18} />
                </button>

              ) : (

                <button
                  onClick={finalizar}
                  disabled={
                    cargando ||
                    Object.keys(respuestas).length !== preguntas.length
                  }
                  className="bg-green-600 text-white px-6 py-3 rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  {cargando ? "Calificando..." : "Finalizar"}
                </button>

              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Cuestionarios;
