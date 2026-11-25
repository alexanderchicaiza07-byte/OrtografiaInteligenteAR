
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft
} from "lucide-react";

import axios from "axios";
import { toast } from "sonner";
import api from "../services/api";

function Registro() {

  const navigate = useNavigate();

  // =====================================
  // ESTADOS
  // =====================================

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // REGISTRAR ESTUDIANTE
  // =====================================

  const registrar = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();
    setError("");

    // Validar contraseñas
    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar longitud mínima
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    setCargando(true);

    try {

      const respuesta = await api.post("/auth/registro", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim().toLowerCase(),
        password
      });

      if (respuesta.data.ok) {

        toast.success("Cuenta registrada correctamente");

        // Ir al login
        navigate("/login", { replace: true });

      } else {
        setError(
          respuesta.data.mensaje || "No se pudo registrar"
        );
      }

    } catch (error) {

      if (axios.isAxiosError(error)) {

        setError(
          error.response?.data?.mensaje ||
          "Error al registrar el usuario"
        );

      } else {
        setError("Ocurrió un error inesperado");
      }

    } finally {
      setCargando(false);
    }
  };

  // =====================================
  // INTERFAZ
  // =====================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">

        {/* ENCABEZADO */}
        <div className="text-center mb-7">

          <div className="bg-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-blue-700" />
          </div>

          <h1 className="text-2xl font-bold text-blue-950">
            Crear cuenta
          </h1>

          <p className="text-gray-500 mt-2">
            Regístrate en Ortografía Inteligente AR
          </p>

        </div>

        {/* FORMULARIO */}
        <form onSubmit={registrar}>

          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-3 focus-within:border-blue-600">

                <User size={20} className="text-gray-400 shrink-0" />

                <input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full min-w-0 p-3 outline-none"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="given-name"
                  maxLength={100}
                  required
                />

              </div>
            </div>

            <div>
              <label
                htmlFor="apellido"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Apellido
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-3 focus-within:border-blue-600">

                <User size={20} className="text-gray-400 shrink-0" />

                <input
                  id="apellido"
                  type="text"
                  placeholder="Tu apellido"
                  className="w-full min-w-0 p-3 outline-none"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  autoComplete="family-name"
                  maxLength={100}
                  required
                />

              </div>
            </div>

          </div>

          {/* CORREO */}
          <label
            htmlFor="correo-registro"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Correo electrónico
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600">

            <Mail size={20} className="text-gray-400 shrink-0" />

            <input
              id="correo-registro"
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full min-w-0 p-3 outline-none"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />

          </div>

          {/* CONTRASEÑA */}
          <label
            htmlFor="password-registro"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Contraseña
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600">

            <Lock size={20} className="text-gray-400 shrink-0" />

            <input
              id="password-registro"
              type={mostrarPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              className="w-full min-w-0 p-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="text-gray-400 hover:text-blue-700 cursor-pointer p-2"
            >
              {mostrarPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <label
            htmlFor="confirmar-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirmar contraseña
          </label>

          <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600">

            <Lock size={20} className="text-gray-400 shrink-0" />

            <input
              id="confirmar-password"
              type={mostrarConfirmar ? "text" : "password"}
              placeholder="Repite tu contraseña"
              className="w-full min-w-0 p-3 outline-none"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              aria-label={mostrarConfirmar ? "Ocultar confirmación" : "Mostrar confirmación"}
              className="text-gray-400 hover:text-blue-700 cursor-pointer p-2"
            >
              {mostrarConfirmar ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm text-center p-3 rounded-lg mb-5"
            >
              {error}
            </div>
          )}

          {/* BOTÓN REGISTRO */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
          >

            <UserPlus size={20} />

            {cargando ? "Registrando..." : "Crear cuenta"}

          </button>

        </form>

        {/* VOLVER AL LOGIN */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-2 text-blue-700 hover:underline text-sm font-medium mx-auto mt-6 cursor-pointer"
        >

          <ArrowLeft size={17} />
          Volver al inicio de sesión

        </button>

        <p className="text-center text-xs text-gray-400 mt-7">
          Plataforma Educativa Ortografía Inteligente AR
        </p>

      </div>

    </div>
  );
}

export default Registro;
