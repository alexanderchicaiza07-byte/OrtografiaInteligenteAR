
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  ClipboardList,
  AlertCircle
} from "lucide-react";

import api from "../services/api";

// ======================================
// TIPOS DE DATOS
// ======================================

interface Leccion {
  id_leccion: number;
  id_tema: number;
  titulo: string;
  contenido: string;
  ejemplos: string | null;
  orden: number;
  estado: boolean;
}

// ======================================
// COMPONENTE LECCIONES
// ======================================

function Lecciones() {

  const navigate = useNavigate();

  // ID recibido desde la URL
  const { id_tema } = useParams();

  // ESTADOS
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [leccionAbierta, setLeccionAbierta] = useState<number | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // CONSULTAR LECCIONES
  // ======================================

  const obtenerLecciones = async () => {

    setCargando(true);
    setError("");

    try {

      // Si existe id_tema, consultar por tema
      // Si no existe, consultar todas
      const ruta = id_tema
        ? `/lecciones/tema/${id_tema}`
        : "/lecciones";

      const respuesta = await api.get(ruta);

      if (respuesta.data.ok) {

        const datos = respuesta.data.lecciones;

        if (!Array.isArray(datos)) {
          setLecciones([]);
          setError("La API devolvió un formato incorrecto");
          return;
        }

        // Mostrar solamente lecciones activas
        const activas = datos.filter(
          (leccion: Leccion) => leccion.estado === true
        );

        // Ordenar las lecciones
        activas.sort((a: Leccion, b: Leccion) => {
          if (a.id_tema !== b.id_tema) {
            return a.id_tema - b.id_tema;
          }

          return a.orden - b.orden;
        });

        setLecciones(activas);
        setLeccionAbierta(null);

      } else {

        setLecciones([]);
        setError("No se pudieron consultar las lecciones");

      }

    } catch (error) {

      console.error("Error al consultar lecciones:", error);

      setLecciones([]);
      setError("No se pudo cargar la información de las lecciones");

    } finally {

      setCargando(false);

    }
  };

  // ======================================
  // CARGAR DATOS
  // ======================================

  useEffect(() => {
    obtenerLecciones();
  }, [id_tema]);

  // ======================================
  // ABRIR O CERRAR LECCIÓN
  // ======================================

  const mostrarLeccion = (id: number) => {

    if (leccionAbierta === id) {
      setLeccionAbierta(null);
    } else {
      setLeccionAbierta(id);
    }

  };

  // ======================================
  // IR A CUESTIONARIOS
  // ======================================

  const irCuestionario = (tema: number) => {

    navigate(`/estudiante/cuestionarios/${tema}`);

  };

  // ======================================
  // INTERFAZ
  // ======================================

  return (
    <div className="max-w-6xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-blue-950">
            Lecciones educativas
          </h1>

          <p className="text-gray-500 mt-2">
            Aprende las reglas de ortografía paso a paso.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* VOLVER A TEMAS */}
          <button
            onClick={() => navigate("/estudiante/temas")}
            className="flex items-center gap-2 bg-white border border-gray-200 text-blue-950 px-4 py-2 rounded-xl hover:bg-blue-50 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Temas
          </button>

          {/* ACTUALIZAR */}
          <button
            onClick={obtenerLecciones}
            disabled={cargando}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>

        </div>

      </div>

      {/* RESUMEN */}
      <div className="bg-blue-100 border border-blue-200 rounded-2xl p-5 mb-8">

        <div className="flex items-center gap-3">

          <BookOpen size={28} className="text-blue-700" />

          <div>

            <h2 className="font-bold text-blue-950">
              {lecciones.length} lecciones disponibles
            </h2>

            <p className="text-sm text-blue-700">
              Selecciona una lección para visualizar el contenido.
            </p>

          </div>

        </div>

      </div>

      {/* ERROR */}
      {error && (

        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3"
        >
          <AlertCircle size={20} />
          {error}
        </div>

      )}

      {/* CARGANDO */}
      {cargando ? (

        <div className="text-center py-16 text-gray-500">
          Cargando lecciones...
        </div>

      ) : lecciones.length === 0 && !error ? (

        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">

          <BookOpen
            size={45}
            className="text-gray-300 mx-auto mb-4"
          />

          <p className="text-gray-500">
            No existen lecciones disponibles.
          </p>

        </div>

      ) : (

        // ======================================
        // LISTADO DE LECCIONES
        // ======================================

        <div className="space-y-5">

          {lecciones.map((leccion) => (

            <div
              key={leccion.id_leccion}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >

              {/* ENCABEZADO DE LA LECCIÓN */}
              <button
                type="button"
                onClick={() => mostrarLeccion(leccion.id_leccion)}
                aria-expanded={leccionAbierta === leccion.id_leccion}
                className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-blue-50 cursor-pointer transition"
              >

                <div className="flex items-center gap-4">

                  <div className="bg-blue-100 rounded-xl w-12 h-12 flex items-center justify-center shrink-0">

                    <BookOpen
                      className="text-blue-700"
                      size={24}
                    />

                  </div>

                  <div>

                    <p className="text-blue-700 text-xs font-semibold mb-1">
                      Lección {leccion.orden}
                    </p>

                    <h2 className="text-lg font-bold text-blue-950">
                      {leccion.titulo}
                    </h2>

                  </div>

                </div>

                {leccionAbierta === leccion.id_leccion ? (

                  <ChevronUp
                    className="text-blue-700 shrink-0"
                    size={23}
                  />

                ) : (

                  <ChevronDown
                    className="text-gray-500 shrink-0"
                    size={23}
                  />

                )}

              </button>

              {/* CONTENIDO DE LA LECCIÓN */}
              {leccionAbierta === leccion.id_leccion && (

                <div className="px-6 pb-6 border-t border-gray-100">

                  {/* TEXTO EDUCATIVO */}
                  <div className="mt-6">

                    <h3 className="font-bold text-blue-950 mb-3">
                      Contenido de la lección
                    </h3>

                    <p className="text-gray-700 leading-8 whitespace-pre-line">
                      {leccion.contenido}
                    </p>

                  </div>

                  {/* EJEMPLOS */}
                  {leccion.ejemplos && (

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mt-6">

                      <div className="flex items-center gap-2 mb-3">

                        <Lightbulb
                          size={22}
                          className="text-amber-600"
                        />

                        <h3 className="font-bold text-amber-900">
                          Ejemplos prácticos
                        </h3>

                      </div>

                      <p className="text-amber-900 leading-7 whitespace-pre-line">
                        {leccion.ejemplos}
                      </p>

                    </div>

                  )}

                  {/* BOTÓN CUESTIONARIO */}
                  <div className="flex justify-end mt-6">

                    <button
                      onClick={() => irCuestionario(leccion.id_tema)}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition"
                    >

                      <ClipboardList size={19} />

                      Practicar cuestionario

                      <ArrowRight size={18} />

                    </button>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Lecciones;
