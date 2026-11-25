
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  Pencil,
  GraduationCap,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import api from "../services/api";

// ======================================
// TIPO DE DATO
// ======================================

interface Tema {
  id_tema: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  estado: boolean;
}

// ======================================
// COMPONENTE TEMAS
// ======================================

function Temas() {

  const navigate = useNavigate();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // CONSULTAR TEMAS
  // ======================================

  const obtenerTemas = async () => {

    setCargando(true);
    setError("");

    try {

      const respuesta = await api.get("/temas");

      if (respuesta.data.ok) {

        const datos = respuesta.data.temas;

        if (!Array.isArray(datos)) {
          setError("La API devolvió un formato incorrecto");
          setTemas([]);
          return;
        }

        // Mostrar solo temas activos
        const temasActivos = datos.filter(
          (tema: Tema) => tema.estado === true
        );

        setTemas(temasActivos);

      } else {

        setError("No se pudieron consultar los temas");

      }

    } catch (error) {

      console.error("Error al obtener temas:", error);

      setError(
        "No se pudo conectar con el servidor"
      );

    } finally {

      setCargando(false);

    }
  };

  // ======================================
  // CARGAR AL INICIAR
  // ======================================

  useEffect(() => {
    obtenerTemas();
  }, []);

  // ======================================
  // ABRIR LECCIONES DEL TEMA
  // ======================================

  const abrirTema = (id_tema: number) => {

    navigate(`/estudiante/lecciones/${id_tema}`);

  };

  // ======================================
  // ICONOS Y COLORES
  // ======================================

  const estilos = [
    {
      icono: BookOpen,
      fondo: "bg-blue-100",
      color: "text-blue-700"
    },
    {
      icono: Pencil,
      fondo: "bg-purple-100",
      color: "text-purple-700"
    },
    {
      icono: GraduationCap,
      fondo: "bg-green-100",
      color: "text-green-700"
    }
  ];

  // ======================================
  // INTERFAZ
  // ======================================

  return (
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-blue-950">
            Temas educativos
          </h1>

          <p className="text-gray-500 mt-2">
            Selecciona un tema para comenzar tu aprendizaje.
          </p>

        </div>

        <button
          onClick={obtenerTemas}
          disabled={cargando}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-950 px-4 py-2 rounded-xl hover:bg-blue-50 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>

      </div>

      {/* TOTAL DE TEMAS */}
      <div className="bg-blue-100 border border-blue-200 rounded-2xl p-5 mb-7">

        <div className="flex items-center gap-3">

          <BookOpen
            size={26}
            className="text-blue-700"
          />

          <div>

            <h2 className="font-bold text-blue-950">
              {temas.length} temas disponibles
            </h2>

            <p className="text-blue-700 text-sm">
              Explora las reglas ortográficas.
            </p>

          </div>

        </div>

      </div>

      {/* MENSAJE DE ERROR */}
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
          Cargando temas educativos...
        </div>

      ) : temas.length === 0 && !error ? (

        <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center">

          <BookOpen
            size={45}
            className="text-gray-300 mx-auto mb-4"
          />

          <p className="text-gray-500">
            No hay temas educativos disponibles.
          </p>

        </div>

      ) : (

        // ======================================
        // TARJETAS DE TEMAS
        // ======================================

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {temas.map((tema, index) => {

            const estilo = estilos[index % estilos.length];
            const Icono = estilo.icono;

            return (

              <div
                key={tema.id_tema}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:border-blue-200 transition"
              >

                {/* ICONO */}
                <div
                  className={`w-14 h-14 ${estilo.fondo} rounded-xl flex items-center justify-center mb-5`}
                >
                  <Icono
                    size={28}
                    className={estilo.color}
                  />
                </div>

                {/* NOMBRE DEL TEMA */}
                <h2 className="text-xl font-bold text-blue-950 mb-3">
                  {tema.nombre}
                </h2>

                {/* DESCRIPCIÓN */}
                <p className="text-gray-500 text-sm min-h-16">
                  {tema.descripcion || "Aprende nuevas reglas ortográficas con este tema."}
                </p>

                {/* BOTÓN */}
                <button
                  onClick={() => abrirTema(tema.id_tema)}
                  className="w-full mt-6 bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
                >

                  Ver lecciones

                  <ArrowRight size={18} />

                </button>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}

export default Temas;
