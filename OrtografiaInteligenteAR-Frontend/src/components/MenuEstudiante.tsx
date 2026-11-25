
import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import {
  BookOpen,
  LayoutDashboard,
  Library,
  ClipboardList,
  ChartColumn,
  Sparkles,
  ScanLine,
  LogOut,
  Menu,
  X,
  UserCircle
} from "lucide-react";

import api from "../services/api";

// ======================================
// MENÚ DEL ESTUDIANTE
// ======================================

function MenuEstudiante() {

  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);

  // ======================================
  // VERIFICAR SESIÓN
  // ======================================

  useEffect(() => {

    const verificarSesion = async () => {
      try {

        const respuesta = await api.get("/auth/perfil");
        const usuario = respuesta.data.usuario;

        if (usuario.rol !== "ESTUDIANTE") {
          navigate(
            usuario.rol === "ADMIN" ? "/admin" : "/login",
            { replace: true }
          );
          return;
        }

        setNombre(usuario.nombre);

      } catch (error) {

        navigate("/login", { replace: true });

      } finally {

        setCargando(false);

      }
    };

    verificarSesion();

  }, [navigate]);

  // ======================================
  // CERRAR SESIÓN
  // ======================================

  const cerrarSesion = async () => {

    try {

      await api.post("/auth/logout");

      navigate("/login", { replace: true });

    } catch (error) {

      alert("No se pudo cerrar sesión");

    }
  };

  // ======================================
  // OPCIONES DEL MENÚ
  // ======================================

  const opciones = [
    {
      nombre: "Inicio",
      ruta: "/estudiante",
      icono: LayoutDashboard
    },
    {
      nombre: "Temas educativos",
      ruta: "/estudiante/temas",
      icono: BookOpen
    },
    {
      nombre: "Lecciones",
      ruta: "/estudiante/lecciones",
      icono: Library
    },
    {
      nombre: "Cuestionarios",
      ruta: "/estudiante/cuestionarios",
      icono: ClipboardList
    },
    {
      nombre: "Mis resultados",
      ruta: "/estudiante/resultados",
      icono: ChartColumn
    },
    {
      nombre: "Asistente IA",
      ruta: "/estudiante/asistente-ia",
      icono: Sparkles
    },
    {
      nombre: "Realidad aumentada",
      ruta: "/estudiante/realidad-ar",
      icono: ScanLine
    }
  ];

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-blue-900 font-medium">
          Verificando sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MENÚ LATERAL */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 z-50
          bg-blue-950 text-white
          flex flex-col
          transition-transform duration-300
          ${menuAbierto
            ? "translate-x-0"
            : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >

        {/* LOGO */}
        <div className="p-6 border-b border-blue-800">

          <div className="flex items-center gap-3">

            <div className="bg-blue-700 p-3 rounded-xl">
              <BookOpen size={25} />
            </div>

            <div>
              <h1 className="font-bold text-sm">
                Ortografía
              </h1>

              <p className="text-blue-300 text-xs">
                Inteligente AR
              </p>
            </div>

          </div>

        </div>

        {/* OPCIONES */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          <p className="text-xs text-blue-400 uppercase px-3 mb-3">
            Módulos educativos
          </p>

          {opciones.map((opcion) => {

            const Icono = opcion.icono;

            return (
              <NavLink
                key={opcion.ruta}
                to={opcion.ruta}
                end={opcion.ruta === "/estudiante"}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    isActive
                      ? "bg-blue-700 text-white font-semibold"
                      : "text-blue-200 hover:bg-blue-900 hover:text-white"
                  }`
                }
              >
                <Icono size={19} />
                {opcion.nombre}
              </NavLink>
            );

          })}

        </nav>

        {/* USUARIO Y SALIR */}
        <div className="p-4 border-t border-blue-800">

          <div className="flex items-center gap-3 mb-4">

            <UserCircle size={34} className="text-blue-300" />

            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {nombre}
              </p>

              <p className="text-xs text-blue-300">
                Estudiante
              </p>
            </div>

          </div>

          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-xl cursor-pointer transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* FONDO OSCURO EN MÓVIL */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="lg:ml-64 min-h-screen">

        {/* BARRA SUPERIOR */}
        <header className="bg-white border-b border-gray-200 h-18 px-5 lg:px-8 flex items-center justify-between sticky top-0 z-30">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="lg:hidden text-blue-950 cursor-pointer"
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            >
              {menuAbierto ? <X /> : <Menu />}
            </button>

            <h2 className="text-blue-950 font-semibold text-sm sm:text-lg">
              Plataforma Educativa
            </h2>

          </div>

          <div className="flex items-center gap-2 text-blue-950">

            <UserCircle size={25} />

            <span className="hidden sm:block text-sm font-medium">
              {nombre}
            </span>

          </div>

        </header>

        {/* AQUÍ SE CARGAN LAS PANTALLAS */}
        <main className="p-4 md:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default MenuEstudiante;
