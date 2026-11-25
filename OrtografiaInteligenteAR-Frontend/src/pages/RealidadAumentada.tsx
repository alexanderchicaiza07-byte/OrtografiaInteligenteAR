
import { useEffect, useState } from "react";
import {
  ScanLine,
  Camera,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import api from "../services/api";

interface Marcador {
  id_marcador: number;
  id_tema: number;
  nombre: string;
  archivo_marcador: string;
  contenido_ar: string;
  estado: boolean;
}

function RealidadAR() {

  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [seleccionado, setSeleccionado] = useState<Marcador | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const obtenerMarcadores = async () => {
      try {

        const respuesta = await api.get("/marcadores");
        setMarcadores(respuesta.data.marcadores || []);

      } catch {
        setError("No se pudieron consultar los marcadores");
      } finally {
        setCargando(false);
      }
    };

    obtenerMarcadores();

  }, []);

  // Solo permitir archivos locales de patrones
  const rutaValida = (ruta: string) =>
    /^\/assets\/ar\/[a-zA-Z0-9_-]+\.patt$/.test(ruta);

  if (seleccionado) {

    const archivo = seleccionado.archivo_marcador;

    const visor = `/ar-visor.html?archivo=${
      encodeURIComponent(archivo)
    }`;

    return (
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => setSeleccionado(null)}
          className="flex items-center gap-2 text-blue-700 mb-5 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Volver a marcadores
        </button>

        <h1 className="text-2xl font-bold text-blue-950 mb-3">
          {seleccionado.nombre}
        </h1>

        <p className="text-gray-500 mb-5">
          Apunta la cámara hacia el marcador impreso.
        </p>

        {!rutaValida(archivo) ? (

          <p className="bg-red-50 text-red-700 p-4 rounded-xl">
            La ruta del marcador no tiene un formato válido.
          </p>

        ) : (

          <div className="bg-white border rounded-2xl overflow-hidden">

            <iframe
              title="Visor de realidad aumentada"
              src={visor}
              allow="camera"
              className="w-full h-[460px] border-0 bg-gray-900"
            />

          </div>

        )}

        <div className="bg-blue-50 rounded-xl p-5 mt-5">

          <h3 className="font-bold text-blue-950 mb-2">
            Contenido educativo
          </h3>

          <p className="text-gray-700 whitespace-pre-line">
            {seleccionado.contenido_ar}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

      <div className="flex items-center gap-3 mb-5">
        <ScanLine size={35} className="text-blue-700" />

        <h1 className="text-3xl font-bold text-blue-950">
          Realidad aumentada
        </h1>
      </div>

      <p className="text-gray-500 mb-8">
        Selecciona una tarjeta educativa para activar la cámara.
      </p>

      {error && (
        <p className="text-red-600 mb-5">{error}</p>
      )}

      {cargando ? (
        <p>Cargando marcadores...</p>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {marcadores.map(marcador => (

            <div
              key={marcador.id_marcador}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >

              <div className="bg-green-100 w-14 h-14 flex items-center justify-center rounded-xl mb-4">
                <BookOpen className="text-green-700" size={28} />
              </div>

              <h2 className="text-xl font-bold text-blue-950">
                {marcador.nombre}
              </h2>

              <p className="text-gray-500 text-sm mt-3">
                {marcador.contenido_ar}
              </p>

              <button
                onClick={() => setSeleccionado(marcador)}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl mt-6 flex justify-center items-center gap-2 cursor-pointer"
              >
                <Camera size={19} />
                Abrir cámara
              </button>

            </div>

          ))}

          {marcadores.length === 0 && (
            <p className="text-gray-500">
              No hay marcadores activos disponibles.
            </p>
          )}

        </div>

      )}

    </div>
  );
}

export default RealidadAR;
