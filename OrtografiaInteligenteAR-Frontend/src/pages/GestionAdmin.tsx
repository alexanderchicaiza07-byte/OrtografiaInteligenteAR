
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  RefreshCw,
  Save,
  XCircle
} from "lucide-react";
import api from "../services/api";

type Modulo = "temas" | "lecciones" | "marcadores" | "preguntas";

interface Props {
  modulo: Modulo;
}

interface Registro {
  id_tema?: number;
  id_leccion?: number;
  id_marcador?: number;
  id_pregunta?: number;
  nombre?: string;
  titulo?: string;
  enunciado?: string;
  descripcion?: string;
  contenido?: string;
  ejemplos?: string;
  explicacion?: string;
  archivo_marcador?: string;
  contenido_ar?: string;
  orden?: number;
  estado?: boolean;
  opciones?: Opcion[];
}

interface Opcion {
  id_opcion?: number;
  texto: string;
  es_correcta: boolean;
}

const opcionesVacias = (): Opcion[] => [
  { texto: "", es_correcta: true },
  { texto: "", es_correcta: false },
  { texto: "", es_correcta: false },
  { texto: "", es_correcta: false }
];

const formularioVacio = (): Registro => ({
  id_tema: 0,
  nombre: "",
  titulo: "",
  enunciado: "",
  descripcion: "",
  contenido: "",
  ejemplos: "",
  explicacion: "",
  archivo_marcador: "",
  contenido_ar: "",
  orden: 1,
  opciones: opcionesVacias()
});

function GestionAdmin({ modulo }: Props) {

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [temas, setTemas] = useState<Registro[]>([]);

  const [formulario, setFormulario] = useState<Registro>(
    formularioVacio()
  );

  const [idEditar, setIdEditar] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [temaFiltro, setTemaFiltro] = useState(0);

  const titulos: Record<Modulo, string> = {
    temas: "Gestión de temas",
    lecciones: "Gestión de lecciones",
    marcadores: "Gestión de marcadores AR",
    preguntas: "Gestión de preguntas"
  };

  const obtenerId = (r: Registro): number => {
    return Number(
      r.id_tema && modulo === "temas" ? r.id_tema :
      r.id_leccion && modulo === "lecciones" ? r.id_leccion :
      r.id_marcador && modulo === "marcadores" ? r.id_marcador :
      r.id_pregunta || 0
    );
  };

  // =====================================
  // CARGAR REGISTROS
  // =====================================

  const cargarDatos = async () => {

    setCargando(true);
    setError("");

    try {

      const respuestaTemas = await api.get("/temas");
      const listaTemas = respuestaTemas.data.temas || [];
      setTemas(listaTemas);

      if (modulo === "preguntas") {

        const id = temaFiltro || listaTemas[0]?.id_tema;

        if (!id) {
          setRegistros([]);
          return;
        }

        const respuesta = await api.get(
          `/preguntas/tema/${id}`
        );

        setRegistros(respuesta.data.preguntas || []);

      } else {

        const respuesta = await api.get(`/${modulo}`);

        const datos = respuesta.data[modulo] || [];

        setRegistros(datos);
      }

    } catch (error) {
      console.error(error);
      setError("No se pudieron consultar los registros");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setFormulario(formularioVacio());
    setIdEditar(null);
    setMostrarFormulario(false);
    setTemaFiltro(0);
  }, [modulo]);

  useEffect(() => {
    cargarDatos();
  }, [modulo, temaFiltro]);

  // =====================================
  // ABRIR FORMULARIO
  // =====================================

  const nuevo = () => {
    setFormulario({
      ...formularioVacio(),
      id_tema: temaFiltro || temas[0]?.id_tema || 0
    });
    setIdEditar(null);
    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  };

  const editar = (registro: Registro) => {
    setFormulario({
      ...registro,
      opciones: registro.opciones
        ? registro.opciones.map(o => ({ ...o }))
        : opcionesVacias()
    });
    setIdEditar(obtenerId(registro));
    setMostrarFormulario(true);
    setError("");
    setMensaje("");
  };

  // =====================================
  // ACTUALIZAR CAMPOS
  // =====================================

  const cambiar = (
    campo: keyof Registro,
    valor: string | number
  ) => {
    setFormulario({
      ...formulario,
      [campo]: valor
    });
  };

  const cambiarOpcion = (
    index: number,
    texto: string
  ) => {

    const opciones = [...(formulario.opciones || opcionesVacias())];

    opciones[index] = {
      ...opciones[index],
      texto
    };

    setFormulario({ ...formulario, opciones });
  };

  const seleccionarCorrecta = (index: number) => {

    const opciones = (formulario.opciones || opcionesVacias())
      .map((opcion, i) => ({
        ...opcion,
        es_correcta: i === index
      }));

    setFormulario({ ...formulario, opciones });
  };

  // =====================================
  // GUARDAR REGISTRO
  // =====================================

  const guardar = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      setCargando(true);
      setError("");

      let datos: Record<string, unknown> = {};

      if (modulo === "temas") {
        datos = {
          nombre: formulario.nombre,
          descripcion: formulario.descripcion,
          orden: Number(formulario.orden)
        };
      }

      if (modulo === "lecciones") {
        datos = {
          id_tema: Number(formulario.id_tema),
          titulo: formulario.titulo,
          contenido: formulario.contenido,
          ejemplos: formulario.ejemplos,
          orden: Number(formulario.orden)
        };
      }

      if (modulo === "marcadores") {
        datos = {
          id_tema: Number(formulario.id_tema),
          nombre: formulario.nombre,
          archivo_marcador: formulario.archivo_marcador,
          contenido_ar: formulario.contenido_ar
        };
      }

      if (modulo === "preguntas") {
        datos = {
          id_tema: Number(formulario.id_tema),
          enunciado: formulario.enunciado,
          explicacion: formulario.explicacion,
          opciones: formulario.opciones
        };
      }

      if (idEditar) {
        await api.put(`/${modulo}/${idEditar}`, datos);
      } else {
        await api.post(`/${modulo}`, datos);
      }

      setMostrarFormulario(false);
      setMensaje("Registro guardado correctamente");
      await cargarDatos();

    } catch (error) {

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.mensaje ||
          "No se pudo guardar el registro"
        );
      } else {
        setError("Error al guardar");
      }

    } finally {
      setCargando(false);
    }
  };

  // =====================================
  // CAMBIAR ESTADO
  // =====================================

  const cambiarEstado = async (registro: Registro) => {

    const id = obtenerId(registro);

    try {

      setError("");
      setMensaje("");

      await api.patch(
        `/${modulo}/${id}/estado`,
        { estado: !registro.estado }
      );

      setMensaje("Estado actualizado correctamente");
      await cargarDatos();

    } catch {
      setError("No se pudo cambiar el estado");
    }
  };

  // =====================================
  // CAMPOS DE FORMULARIO
  // =====================================

  const campoTexto = (
    etiqueta: string,
    campo: keyof Registro,
    obligatorio = true
  ) => (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {etiqueta}
      </span>

      <input
        type="text"
        value={String(formulario[campo] ?? "")}
        onChange={e => cambiar(campo, e.target.value)}
        required={obligatorio}
        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-600"
      />
    </label>
  );

  const campoArea = (
    etiqueta: string,
    campo: keyof Registro
  ) => (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {etiqueta}
      </span>

      <textarea
        value={String(formulario[campo] ?? "")}
        onChange={e => cambiar(campo, e.target.value)}
        rows={4}
        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-blue-600"
      />
    </label>
  );

  return (
    <div className="max-w-6xl mx-auto">

      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">

        <div>
          <h1 className="text-3xl font-bold text-blue-950">
            {titulos[modulo]}
          </h1>

          <p className="text-gray-500 mt-2">
            Administración del contenido educativo.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={cargarDatos}
            className="border rounded-xl bg-white p-3 cursor-pointer"
            aria-label="Actualizar"
          >
            <RefreshCw size={19} />
          </button>

          <button
            onClick={nuevo}
            className="bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Plus size={19} />
            Nuevo
          </button>

        </div>
      </div>

      {/* FILTRO DE PREGUNTAS */}
      {modulo === "preguntas" && (
        <div className="bg-white p-5 rounded-2xl border mb-6">
          <label className="block text-sm font-medium mb-2">
            Consultar preguntas del tema
          </label>

          <select
            value={temaFiltro}
            onChange={e => setTemaFiltro(Number(e.target.value))}
            className="border p-3 rounded-xl w-full"
          >
            <option value={0}>Primer tema disponible</option>

            {temas.map(tema => (
              <option
                key={tema.id_tema}
                value={tema.id_tema}
              >
                {tema.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {mensaje && (
        <p className="bg-green-50 text-green-700 p-4 rounded-xl mb-5">
          {mensaje}
        </p>
      )}

      {error && (
        <p className="bg-red-50 text-red-700 p-4 rounded-xl mb-5">
          {error}
        </p>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <form
          onSubmit={guardar}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-7"
        >

          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl text-blue-950">
              {idEditar ? "Editar registro" : "Nuevo registro"}
            </h2>

            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="cursor-pointer"
              aria-label="Cerrar formulario"
            >
              <XCircle />
            </button>
          </div>

          {modulo !== "temas" && (
            <label className="block mb-4">
              <span className="block text-sm font-medium mb-2">
                Tema educativo
              </span>

              <select
                value={formulario.id_tema || 0}
                onChange={e => cambiar(
                  "id_tema",
                  Number(e.target.value)
                )}
                required
                className="w-full border rounded-xl p-3"
              >
                <option value={0}>Selecciona un tema</option>
                {temas.map(tema => (
                  <option
                    key={tema.id_tema}
                    value={tema.id_tema}
                  >
                    {tema.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          {modulo === "temas" && (
            <>
              {campoTexto("Nombre del tema", "nombre")}
              {campoArea("Descripción", "descripcion")}
            </>
          )}

          {modulo === "lecciones" && (
            <>
              {campoTexto("Título", "titulo")}
              {campoArea("Contenido", "contenido")}
              {campoArea("Ejemplos", "ejemplos")}
            </>
          )}

          {modulo === "marcadores" && (
            <>
              {campoTexto("Nombre del marcador", "nombre")}
              {campoTexto(
                "Ruta del archivo .patt",
                "archivo_marcador"
              )}
              {campoArea("Contenido AR", "contenido_ar")}
            </>
          )}

          {modulo === "preguntas" && (
            <>
              {campoTexto("Enunciado", "enunciado")}
              {campoArea("Explicación", "explicacion")}

              <h3 className="font-bold text-blue-950 mb-3">
                Cuatro opciones de respuesta
              </h3>

              {(formulario.opciones || []).map(
                (opcion, index) => (

                  <div
                    key={index}
                    className="flex items-center gap-3 mb-3"
                  >

                    <input
                      type="radio"
                      name="correcta"
                      checked={opcion.es_correcta}
                      onChange={() => seleccionarCorrecta(index)}
                    />

                    <input
                      value={opcion.texto}
                      onChange={e => cambiarOpcion(
                        index,
                        e.target.value
                      )}
                      placeholder={`Opción ${index + 1}`}
                      required
                      className="flex-1 min-w-0 border rounded-xl p-3"
                    />

                  </div>

                )
              )}

              <p className="text-xs text-gray-500 mb-5">
                Selecciona el círculo de la respuesta correcta.
              </p>
            </>
          )}

          {(modulo === "temas" || modulo === "lecciones") && (
            <label className="block mb-5">
              <span className="block text-sm font-medium mb-2">
                Orden
              </span>

              <input
                type="number"
                min={1}
                value={formulario.orden || 1}
                onChange={e => cambiar(
                  "orden",
                  Number(e.target.value)
                )}
                className="w-full border rounded-xl p-3"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={19} />
            {cargando ? "Guardando..." : "Guardar"}
          </button>

        </form>
      )}

      {/* LISTADO */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <h2 className="font-bold text-blue-950 text-lg mb-5">
          Registros disponibles
        </h2>

        {cargando && <p className="mb-4">Cargando...</p>}

        {registros.length === 0 ? (
          <p className="text-gray-500">
            No existen registros para mostrar.
          </p>
        ) : (

          <div className="space-y-3">

            {registros.map(registro => {

              const id = obtenerId(registro);

              const nombre =
                registro.nombre ||
                registro.titulo ||
                registro.enunciado ||
                `Registro ${id}`;

              return (
                <div
                  key={id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >

                  <div>
                    <h3 className="font-semibold text-blue-950">
                      {nombre}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      ID: {id}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => editar(registro)}
                      className="bg-blue-100 text-blue-700 p-3 rounded-xl cursor-pointer"
                      aria-label="Editar"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => cambiarEstado(registro)}
                      className={`px-4 py-2 rounded-xl text-sm cursor-pointer ${
                        registro.estado === false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {registro.estado === false
                        ? "Activar"
                        : "Desactivar"}
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default GestionAdmin;
