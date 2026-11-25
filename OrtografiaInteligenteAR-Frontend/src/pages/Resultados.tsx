
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  ClipboardCheck,
  Sparkles,
  RefreshCw
} from "lucide-react";
import api from "../services/api";

interface Resultado {
  id_intento: number;
  id_tema: number;
  fecha_fin: string | null;
  total_preguntas: number;
  respuestas_correctas: number;
  puntaje: number | string;
}

interface Tema {
  id_tema: number;
  nombre: string;
}

function Resultados() {

  const navigate = useNavigate();

  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = async () => {

    try {
      setCargando(true);
      setError("");

      const [resResultados, resTemas] = await Promise.all([
        api.get("/evaluaciones/mis-resultados"),
        api.get("/temas")
      ]);

      setResultados(resResultados.data.resultados || []);
      setTemas(resTemas.data.temas || []);

    } catch {
      setError("No se pudieron consultar los resultados");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const nombreTema = (id: number) => {
    return temas.find(t => t.id_tema === id)?.nombre ||
      `Tema ${id}`;
  };

  return (
    <div className="max-w-6xl mx-auto">

      <div className="flex justify-between items-center gap-3 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-blue-950">
            Mis resultados
          </h1>
          <p className="text-gray-500 mt-2">
            Consulta tus evaluaciones y calificaciones.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          className="border rounded-xl p-3 bg-white cursor-pointer"
          aria-label="Actualizar resultados"
        >
          <RefreshCw size={20} />
        </button>

      </div>

      {error && (
        <p className="text-red-600 mb-5">{error}</p>
      )}

      {cargando ? (
        <p>Cargando resultados...</p>
      ) : resultados.length === 0 ? (

        <div className="bg-white rounded-2xl p-10 text-center">
          <ClipboardCheck
            size={45}
            className="mx-auto text-gray-400 mb-4"
          />
          <p className="text-gray-500">
            Todavía no has realizado evaluaciones.
          </p>
        </div>

      ) : (

        <div className="space-y-4">

          {resultados.map(resultado => (

            <div
              key={resultado.id_intento}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
            >

              <div>

                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="text-amber-500" />

                  <h2 className="font-bold text-blue-950 text-lg">
                    {nombreTema(resultado.id_tema)}
                  </h2>
                </div>

                <p className="text-gray-500 text-sm">
                  Correctas: {resultado.respuestas_correctas}
                  {" de "}
                  {resultado.total_preguntas}
                </p>

                <p className="text-gray-400 text-xs mt-2">
                  {resultado.fecha_fin
                    ? new Date(resultado.fecha_fin).toLocaleString("es-EC")
                    : "Sin fecha"}
                </p>

              </div>

              <div className="flex items-center gap-5">

                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-700">
                    {Number(resultado.puntaje).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400">
                    Calificación
                  </p>
                </div>

                <button
                  onClick={() => navigate(
                    `/estudiante/asistente-ia/${resultado.id_intento}`
                  )}
                  className="bg-purple-100 text-purple-700 px-4 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-purple-200"
                >
                  <Sparkles size={18} />
                  Explicar
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Resultados;
