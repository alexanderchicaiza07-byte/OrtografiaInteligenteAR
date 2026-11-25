
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  BookOpen,
  LayoutDashboard,
  Library,
  ClipboardList,
  ScanLine,
  LogOut,
  Menu,
  X,
  UserCircle
} from "lucide-react";

import api from "../services/api";

function MenuAdmin() {

  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {

    const verificarAdmin = async () => {
      try {

        const respuesta = await api.get("/admin");

        if (respuesta.data.usuario.rol !== "ADMIN") {
          navigate("/login", { replace: true });
          return;
        }

        setNombre(respuesta.data.usuario.nombre);

      } catch {
        navigate("/login", { replace: true });
      } finally {
        setCargando(false);
      }
    };

    verificarAdmin();

  }, [navigate]);

  const cerrarSesion = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login", { replace: true });
    } catch {
      alert("No se pudo cerrar sesión");
    }
  };

  const opciones = [
    {
      nombre: "Dashboard",
      ruta: "/admin",
      icono: LayoutDashboard
    },
    {
      nombre: "Gestionar temas",
      ruta: "/admin/temas",
      icono: BookOpen
    },
    {
      nombre: "Gestionar lecciones",
      ruta: "/admin/lecciones",
      icono: Library
    },
    {
      nombre: "Gestionar preguntas",
      ruta: "/admin/preguntas",
      icono: ClipboardList
    },
    {
      nombre: "Marcadores AR",
      ruta: "/admin/marcadores",
      icono: ScanLine
    }
  ];

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MENÚ LATERAL */}
      <aside
        className={`
          fixed top-0 left-0 z-50 w-64 h-screen
          bg-blue-950 text-white flex flex-col
          transition-transform duration-300
          ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >

        <div className="p-6 border-b border-blue-800">

          <div className="flex items-center gap-3">

            <div className="bg-blue-700 p-3 rounded-xl">
              <BookOpen size={24} />
            </div>

            <div>
              <h1 className="font-bold text-sm">
                Ortografía
              </h1>

              <p className="text-blue-300 text-xs">
                Administrador AR
              </p>
            </div>

          </div>

        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          <p className="text-xs text-blue-400 uppercase px-3 mb-4">
            Administración
          </p>

          {opciones.map(opcion => {

            const Icono = opcion.icono;

            return (
              <NavLink
                key={opcion.ruta}
                to={opcion.ruta}
                end={opcion.ruta === "/admin"}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                    isActive
                      ? "bg-blue-700 text-white font-semibold"
                      : "text-blue-200 hover:bg-blue-900"
                  }`
                }
              >
                <Icono size={19} />
                {opcion.nombre}
              </NavLink>
            );

          })}

        </nav>

        <div className="p-4 border-t border-blue-800">

          <div className="flex items-center gap-3 mb-4">

            <UserCircle size={32} />

            <div>
              <p className="font-semibold text-sm">{nombre}</p>
              <p className="text-blue-300 text-xs">Administrador</p>
            </div>

          </div>

          <button
            onClick={cerrarSesion}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>

        </div>

      </aside>

      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <div className="lg:ml-64 min-h-screen">

        <header className="bg-white border-b border-gray-200 px-5 lg:px-8 h-18 flex items-center justify-between sticky top-0 z-30">

          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="lg:hidden cursor-pointer"
            aria-label="Abrir o cerrar menú"
          >
            {menuAbierto ? <X /> : <Menu />}
          </button>

          <h2 className="font-bold text-blue-950">
            Panel administrativo
          </h2>

          <span className="text-sm text-gray-500 hidden sm:block">
            {nombre}
          </span>

        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MenuAdmin;
