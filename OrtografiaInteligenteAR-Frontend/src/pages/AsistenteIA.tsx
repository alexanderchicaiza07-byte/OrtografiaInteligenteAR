
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  Bot,
  ArrowLeft,
  ClipboardList
} from "lucide-react";
import axios from "axios";
import api from "../services/api";

interface Intento {
  id_intento: number;
  id_tema: number;
  puntaje: number | string;
}

function AsistenteIA() {

  const navigate = useNavigate();
  const { id_intento } = useParams();

  const [intentos, setIntentos] = useState<Intento[]>([]);
  const [explicacion, setExplicacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Consultar evaluaciones disponibles
  useEffect(() => {

    const cargarIntentos = async () => {
      try {

        const respuesta = await api.get(
          "/evaluaciones/mis-resultados"
        );

        setIntentos(respuesta.data.resultados || []);

      } catch {
        setError("No se pudo consultar el historial");
      }
    };

    cargarIntentos();

  }, []);

  // Solicitar explicación
  const explicar = async (id: number) => {

    try {

      setCargando(true);
      setError("");
      setExplicacion("");

      const respuesta = await api.post(`/ia/explicar/${id}`);

      setExplicacion(respuesta.data.explicacion);

    } catch (error) {

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo generar la explicación"
        );
      } else {
        setError("Error al consultar la IA");
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center gap-3 mb-8">

        <div className="bg-purple-100 p-3 rounded-xl">
          <Bot className="text-purple-700" size={30} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-blue-950">
            Asistente de IA
          </h1>

          <p className="text-gray-500 mt-1">
            Aprende de tus errores ortográficos.
          </p>
        </div>

      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">

        <div className="flex items-center gap-2 mb-5">
          <ClipboardList className="text-blue-700" />

          <h2 className="font-bold text-blue-950">
            Selecciona una evaluación
          </h2>
        </div>

        <div className="space-y-3">

          {intentos.map(intento => (

            <button
              key={intento.id_intento}
              onClick={() => navigate(
                `/estudiante/asistente-ia/${intento.id_intento}`
              )}
              className={`w-full flex justify-between items-center p-4 rounded-xl border text-left cursor-pointer ${
                Number(id_intento) === intento.id_intento
                  ? "bg-purple-50 border-purple-500"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >

              <span className="font-medium">
                Evaluación #{intento.id_intento}
                {" · Tema "}
                {intento.id_tema}
              </span>

              <span className="font-bold text-blue-700">
                {Number(intento.puntaje).toFixed(0)}%
              </span>

            </button>

          ))}

          {intentos.length === 0 && (
            <p className="text-gray-500">
              No tienes evaluaciones disponibles.
            </p>
          )}

        </div>

        {id_intento && (
          <button
            onClick={() => explicar(Number(id_intento))}
            disabled={cargando}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-xl mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={20} />

            {cargando
              ? "Generando explicación..."
              : "Explicar mis errores con IA"}
          </button>
        )}

        {error && (
          <p className="bg-red-50 text-red-700 p-4 rounded-xl mt-5">
            {error}
          </p>
        )}

        {explicacion && (
          <div className="mt-7 bg-purple-50 border border-purple-100 p-6 rounded-2xl">

            <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-4">
              <Sparkles size={20} />
              Retroalimentación educativa
            </h3>

            <p className="text-gray-700 leading-8 whitespace-pre-line">
              {explicacion}
            </p>

          </div>
        )}

      </div>

      <button
        onClick={() => navigate("/estudiante/resultados")}
        className="flex items-center gap-2 text-blue-700 mt-6 cursor-pointer"
      >
        <ArrowLeft size={18} />
        Volver a mis resultados
      </button>

    </div>
  );
}

export default AsistenteIA;
