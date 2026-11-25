
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff
} from "lucide-react";
import axios from "axios";

import api from "../services/api";

function Login() {

  const navigate = useNavigate();

  // =====================================
  // ESTADOS DEL FORMULARIO
  // =====================================

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // =====================================
  // INICIAR SESIÓN
  // =====================================

  const iniciarSesion = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setError("");
    setCargando(true);

    try {

      // Enviar credenciales al backend
      const respuesta = await api.post("/auth/login", {
        correo: correo.trim(),
        password
      });

      if (respuesta.data.ok) {

        // Consultar el perfil usando la cookie JWT
        const perfil = await api.get("/auth/perfil");

        const usuario = perfil.data.usuario;

        if (usuario.rol === "ADMIN") {

          navigate("/admin", { replace: true });

        } else if (usuario.rol === "ESTUDIANTE") {

          navigate("/estudiante", { replace: true });

        } else {

          setError("Rol de usuario no reconocido");

        }

      } else {

        setError(
          respuesta.data.mensaje || "No se pudo iniciar sesión"
        );

      }

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.mensaje ||
          "No se pudo conectar con el servidor"
        );

      } else {

        setError("Ocurrió un error inesperado");

      }

    } finally {

      setCargando(false);

    }
  };

  // =====================================
  // INTERFAZ DEL LOGIN
  // =====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

        {/* LOGO Y TÍTULO */}
        <div className="text-center mb-8">

          <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">

            <BookOpen
              size={40}
              className="text-blue-700"
            />

          </div>

          <h1 className="text-2xl font-bold text-blue-950">
            Ortografía Inteligente AR
          </h1>

          <p className="text-gray-500 mt-2">
            Aprende ortografía con Inteligencia Artificial
            y Realidad Aumentada
          </p>

        </div>

        {/* FORMULARIO */}
        <form onSubmit={iniciarSesion}>

          {/* CORREO ELECTRÓNICO */}
          <label
            htmlFor="correo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Correo electrónico
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600 transition">

            <Mail
              size={20}
              className="text-gray-400 shrink-0"
            />

            <input
              id="correo"
              type="email"
              placeholder="Ingrese su correo"
              className="w-full min-w-0 p-3 outline-none bg-transparent"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />

          </div>

          {/* CONTRASEÑA */}
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contraseña
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-3 focus-within:border-blue-600 transition">

            <Lock
              size={20}
              className="text-gray-400 shrink-0"
            />

            <input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              placeholder="Ingrese su contraseña"
              className="w-full min-w-0 p-3 outline-none bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {/* BOTÓN MOSTRAR / OCULTAR CONTRASEÑA */}
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="text-gray-400 hover:text-blue-700 cursor-pointer p-2 transition shrink-0"
              aria-label={
                mostrarPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              aria-pressed={mostrarPassword}
              title={
                mostrarPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >

              {mostrarPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}

            </button>

          </div>

          {/* RECUPERAR CONTRASEÑA */}
          <div className="text-right mb-5">

            <button
              type="button"
              onClick={() => navigate("/recuperar-clave")}
              className="text-sm text-blue-700 hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>

          </div>

          {/* MENSAJE DE ERROR */}
          {error && (

            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm text-center p-3 rounded-lg mb-5"
            >
              {error}
            </div>

          )}

          {/* BOTÓN INICIAR SESIÓN */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <LogIn size={20} />

            {cargando
              ? "Ingresando..."
              : "Iniciar sesión"
            }

          </button>

        </form>

        {/* REGISTRO DE USUARIO */}
        <div className="text-center mt-6">

          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}

            <button
              type="button"
              onClick={() => navigate("/registro")}
              className="text-blue-700 font-semibold hover:underline cursor-pointer"
            >
              Regístrate
            </button>

          </p>

        </div>

        {/* PIE DE PÁGINA */}
        <div className="border-t border-gray-100 mt-8 pt-5 text-center">

          <p className="text-xs text-gray-400">
            Plataforma Educativa de Ortografía Inteligente AR
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
