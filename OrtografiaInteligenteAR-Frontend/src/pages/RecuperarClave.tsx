
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import axios from "axios";
import api from "../services/api";

function RecuperarClave() {

  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // SOLICITAR RECUPERACIÓN
  // =====================================

  const recuperarClave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setCargando(true);
    setError("");

    try {

      const respuesta = await api.post(
        "/auth/recuperar-clave",
        {
          correo: correo.trim().toLowerCase()
        }
      );

      if (respuesta.data.ok) {
        setEnviado(true);
      } else {
        setError(
          respuesta.data.mensaje ||
          "No se pudo procesar la solicitud"
        );
      }

    } catch (error) {

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.mensaje ||
          "Error al solicitar recuperación"
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
            <BookOpen size={40} className="text-blue-700" />
          </div>

          <h1 className="text-2xl font-bold text-blue-950">
            Recuperar contraseña
          </h1>

          <p className="text-gray-500 mt-2">
            Ingresa tu correo electrónico para recuperar
            el acceso a tu cuenta.
          </p>

        </div>

        {!enviado ? (

          <form onSubmit={recuperarClave}>

            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo electrónico
            </label>

            <div className="flex items-center border border-gray-300 rounded-xl px-3 mb-5 focus-within:border-blue-600">

              <Mail size={20} className="text-gray-400 shrink-0" />

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full min-w-0 p-3 outline-none"
                autoComplete="email"
                required
              />

            </div>

            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={19} />
              {cargando ? "Enviando..." : "Enviar enlace"}
            </button>

          </form>

        ) : (

          <div className="text-center">

            <CheckCircle
              size={55}
              className="text-green-600 mx-auto mb-4"
            />

            <h2 className="text-xl font-bold text-gray-800">
              Solicitud procesada
            </h2>

            <p className="text-gray-600 mt-3">
              Si el correo está registrado, recibirás
              un enlace para restablecer tu contraseña.
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Revisa también la carpeta de spam.
            </p>

          </div>

        )}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-2 text-blue-700 hover:underline text-sm font-medium mx-auto mt-7 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Volver al inicio de sesión
        </button>

      </div>

    </div>
  );
}

export default RecuperarClave;
