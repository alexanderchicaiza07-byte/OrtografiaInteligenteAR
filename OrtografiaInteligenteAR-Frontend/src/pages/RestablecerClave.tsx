import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle } from "lucide-react";
import axios from "axios";
import api from "../services/api";

function RestablecerClave() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // VALIDAR TOKEN DE RECUPERACIÓN
  // =====================================

  useEffect(() => {
    const validarToken = async () => {
      if (!token) {
        setValidando(false);
        setTokenValido(false);
        return;
      }

      try {
        const respuesta = await api.post("/auth/validar-token", { token });

        setTokenValido(respuesta.data.ok === true);
      } catch {
        setTokenValido(false);
      } finally {
        setValidando(false);
      }
    };

    validarToken();
  }, [token]);

  // =====================================
  // RESTABLECER CONTRASEÑA
  // =====================================

  const restablecer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token || !tokenValido) {
      setError("El enlace no es válido");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post("/auth/restablecer-clave", {
        token,
        password,
        confirmarPassword: confirmar,
      });

      if (respuesta.data.ok) {
        setCompletado(true);
      } else {
        setError(
          respuesta.data.mensaje || "No se pudo restablecer la contraseña",
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.mensaje || "Error al cambiar la contraseña",
        );
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-7">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound size={40} className="text-blue-700" />
          </div>

          <h1 className="text-2xl font-bold text-blue-950">Nueva contraseña</h1>
        </div>

        {validando ? (
          <p className="text-center text-gray-600">Validando enlace...</p>
        ) : completado ? (
          <div className="text-center">
            <CheckCircle size={55} className="text-green-600 mx-auto mb-4" />

            <h2 className="text-lg font-bold">¡Contraseña actualizada!</h2>

            <p className="text-gray-500 mt-3">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>

            <button
              onClick={() => navigate("/login", { replace: true })}
              className="bg-blue-700 text-white w-full py-3 rounded-xl mt-6 cursor-pointer"
            >
              Ir al Login
            </button>
          </div>
        ) : !tokenValido ? (
          <div className="text-center">
            <p className="text-red-600 font-medium">
              El enlace es inválido o ha expirado.
            </p>

            <button
              onClick={() => navigate("/recuperar-clave")}
              className="bg-blue-700 text-white w-full py-3 rounded-xl mt-6 cursor-pointer"
            >
              Solicitar otro enlace
            </button>
          </div>
        ) : (
          <form onSubmit={restablecer}>
            <p className="text-gray-500 mb-6 text-sm">
              Ingresa una nueva contraseña para tu cuenta.
            </p>

            {/* CONTRASEÑA */}
            <label className="block text-sm font-medium mb-2">
              Nueva contraseña
            </label>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600">
              <Lock size={20} className="text-gray-400 shrink-0" />

              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full min-w-0 p-3 outline-none"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="text-gray-400 hover:text-blue-700 cursor-pointer p-2"
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* CONFIRMAR */}
            <label className="block text-sm font-medium mb-2">
              Confirmar contraseña
            </label>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600">
              <Lock size={20} className="text-gray-400 shrink-0" />

              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                className="w-full min-w-0 p-3 outline-none"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="text-gray-400 hover:text-blue-700 cursor-pointer p-2"
                aria-label={
                  mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-red-600 text-sm mb-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
            >
              {cargando ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestablecerClave;
