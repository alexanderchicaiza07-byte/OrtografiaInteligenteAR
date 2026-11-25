
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  ClipboardList,
  Trophy,
  ChartColumn,
  ArrowRight,
  Brain,
  ScanLine,
  RefreshCw
} from "lucide-react";

import api from "../services/api";

// ======================================
// TIPOS DE DATOS
// ======================================

interface Tema {
  id_tema: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

interface Resultado {
  id_intento: number;
  id_tema: number;
  total_preguntas: number;
  respuestas_correctas: number;
  puntaje: number | string;
  fecha_fin: string | null;
}

// ======================================
// DASHBOARD DEL ESTUDIANTE
// ======================================

function DashboardEstudiante() {

  const navigate = useNavigate();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // CARGAR INFORMACIÓN
  // ======================================

  const cargarDatos = async () => {

    setCargando(true);
    setError("");

    try {

      const respuesta = await Promise.all([
        api.get("/temas"),
        api.get("/evaluaciones/mis-resultados")
      ]);

      const datosTemas = respuesta[0].data.temas;
      const datosResultados = respuesta[1].data.resultados;

      setTemas(
        Array.isArray(datosTemas) ? datosTemas : []
      );

      setResultados(
        Array.isArray(datosResultados) ? datosResultados : []
      );

    } catch (error) {

      console.error("Error al cargar dashboard:", error);

      setError("No se pudo cargar la información del dashboard");

    } finally {

      setCargando(false);

    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // ======================================
  // CÁLCULO DE ESTADÍSTICAS
  // ======================================

  const totalTemas = temas.length;

  const totalEvaluaciones = resultados.length;

  const promedio = totalEvaluaciones > 0
    ? resultados.reduce(
        (suma, resultado) =>
          suma + Number(resultado.puntaje),
        0
      ) / totalEvaluaciones
    : 0;

  const ultimaEvaluacion = resultados.length > 0
    ? resultados[0]
    : null;

  // ======================================
  // ESTADO DE CARGA
  // ======================================

  if (cargando) {
    return (
      <div className="py-20 text-center text-blue-950">
        Cargando información del estudiante...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-blue-950">
            Mi aprendizaje
          </h1>

          <p className="text-gray-500 mt-2">
            Revisa tu progreso y continúa practicando ortografía.
          </p>

        </div>

        <button
          onClick={cargarDatos}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-950 px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-50"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-9">

        {/* TEMAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <BookOpen className="text-blue-700" size={25} />
          </div>

          <p className="text-gray-500 text-sm">
            Temas disponibles
          </p>

          <h2 className="text-3xl font-bold text-blue-950 mt-1">
            {totalTemas}
          </h2>

        </div>

        {/* EVALUACIONES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <ClipboardList className="text-purple-700" size={25} />
          </div>

          <p className="text-gray-500 text-sm">
            Evaluaciones realizadas
          </p>

          <h2 className="text-3xl font-bold text-blue-950 mt-1">
            {totalEvaluaciones}
          </h2>

        </div>

        {/* PROMEDIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            <Trophy className="text-green-700" size={25} />
          </div>

          <p className="text-gray-500 text-sm">
            Promedio de calificaciones
          </p>

          <h2 className="text-3xl font-bold text-blue-950 mt-1">
            {promedio.toFixed(1)}%
          </h2>

        </div>

        {/* ÚLTIMA CALIFICACIÓN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
            <ChartColumn className="text-orange-700" size={25} />
          </div>

          <p className="text-gray-500 text-sm">
            Última calificación
          </p>

          <h2 className="text-3xl font-bold text-blue-950 mt-1">
            {ultimaEvaluacion
              ? Number(ultimaEvaluacion.puntaje).toFixed(1) + "%"
              : "Sin datos"
            }
          </h2>

        </div>

      </div>

      {/* MÓDULOS DE APRENDIZAJE */}
      <h2 className="text-xl font-bold text-blue-950 mb-5">
        ¿Qué deseas hacer hoy?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-9">

        {/* TEMAS */}
        <button
          onClick={() => navigate("/estudiante/temas")}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left hover:shadow-md hover:border-blue-300 transition cursor-pointer"
        >

          <BookOpen className="text-blue-700 mb-4" size={35} />

          <h3 className="font-bold text-lg text-blue-950">
            Temas educativos
          </h3>

          <p className="text-gray-500 mt-2 text-sm">
            Aprende las reglas de ortografía y mejora tu escritura.
          </p>

          <div className="flex items-center gap-2 text-blue-700 mt-5 font-semibold text-sm">
            Explorar temas
            <ArrowRight size={17} />
          </div>

        </button>

        {/* CUESTIONARIOS */}
        <button
          onClick={() => navigate("/estudiante/cuestionarios")}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left hover:shadow-md hover:border-purple-300 transition cursor-pointer"
        >

          <Brain className="text-purple-700 mb-4" size={35} />

          <h3 className="font-bold text-lg text-blue-950">
            Cuestionarios
          </h3>

          <p className="text-gray-500 mt-2 text-sm">
            Responde preguntas y comprueba tus conocimientos.
          </p>

          <div className="flex items-center gap-2 text-purple-700 mt-5 font-semibold text-sm">
            Practicar ahora
            <ArrowRight size={17} />
          </div>

        </button>

        {/* REALIDAD AUMENTADA */}
        <button
          onClick={() => navigate("/estudiante/realidad-ar")}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-left hover:shadow-md hover:border-green-300 transition cursor-pointer"
        >

          <ScanLine className="text-green-700 mb-4" size={35} />

          <h3 className="font-bold text-lg text-blue-950">
            Realidad aumentada
          </h3>

          <p className="text-gray-500 mt-2 text-sm">
            Utiliza tu cámara para descubrir contenido educativo.
          </p>

          <div className="flex items-center gap-2 text-green-700 mt-5 font-semibold text-sm">
            Explorar AR
            <ArrowRight size={17} />
          </div>

        </button>

      </div>

      {/* TEMAS DISPONIBLES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-bold text-blue-950">
            Temas disponibles
          </h2>

          <button
            onClick={() => navigate("/estudiante/temas")}
            className="text-blue-700 text-sm font-semibold cursor-pointer hover:underline"
          >
            Ver todos
          </button>

        </div>

        {temas.length === 0 ? (

          <p className="text-gray-500">
            No hay temas educativos disponibles.
          </p>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {temas.slice(0, 3).map((tema) => (

              <div
                key={tema.id_tema}
                className="bg-blue-50 rounded-xl p-5"
              >

                <h3 className="font-bold text-blue-950">
                  {tema.nombre}
                </h3>

                <p className="text-gray-600 text-sm mt-2">
                  {tema.descripcion || "Contenido educativo"}
                </p>

                <button
                  onClick={() => navigate("/estudiante/temas")}
                  className="text-blue-700 text-sm font-semibold mt-4 cursor-pointer hover:underline"
                >
                  Ver tema
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default DashboardEstudiante;
