
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  ClipboardList,
  ScanLine,
  ArrowRight
} from "lucide-react";

function DashboardAdmin() {

  const navigate = useNavigate();

  const modulos = [
    {
      nombre: "Temas educativos",
      descripcion: "Registrar, actualizar y administrar temas.",
      ruta: "/admin/temas",
      icono: BookOpen,
      color: "text-blue-700",
      fondo: "bg-blue-100"
    },
    {
      nombre: "Lecciones",
      descripcion: "Administrar contenidos y ejemplos educativos.",
      ruta: "/admin/lecciones",
      icono: Library,
      color: "text-purple-700",
      fondo: "bg-purple-100"
    },
    {
      nombre: "Preguntas",
      descripcion: "Gestionar cuestionarios y opciones de respuesta.",
      ruta: "/admin/preguntas",
      icono: ClipboardList,
      color: "text-green-700",
      fondo: "bg-green-100"
    },
    {
      nombre: "Realidad aumentada",
      descripcion: "Registrar y actualizar marcadores AR.",
      ruta: "/admin/marcadores",
      icono: ScanLine,
      color: "text-orange-700",
      fondo: "bg-orange-100"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-950">
          Dashboard administrativo
        </h1>

        <p className="text-gray-500 mt-2">
          Gestiona los módulos de Ortografía Inteligente AR.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {modulos.map(modulo => {

          const Icono = modulo.icono;

          return (
            <button
              key={modulo.ruta}
              onClick={() => navigate(modulo.ruta)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 text-left hover:shadow-lg cursor-pointer transition"
            >

              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${modulo.fondo} mb-5`}>
                <Icono
                  className={modulo.color}
                  size={27}
                />
              </div>

              <h2 className="text-xl font-bold text-blue-950">
                {modulo.nombre}
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                {modulo.descripcion}
              </p>

              <div className="flex items-center gap-2 text-blue-700 font-semibold mt-5">
                Administrar
                <ArrowRight size={18} />
              </div>

            </button>
          );

        })}

      </div>

    </div>
  );
}

export default DashboardAdmin;
