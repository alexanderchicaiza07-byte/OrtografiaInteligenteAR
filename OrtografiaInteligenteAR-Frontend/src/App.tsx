
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// ======================================
// AUTENTICACIÓN
// ======================================

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import RecuperarClave from "./pages/RecuperarClave";
import RestablecerClave from "./pages/RestablecerClave";

// ======================================
// MENÚS
// ======================================

import MenuEstudiante from "./components/MenuEstudiante";
import MenuAdmin from "./components/MenuAdmin";

// ======================================
// DASHBOARDS
// ======================================

import DashboardEstudiante from "./pages/DashboardEstudiante";
import DashboardAdmin from "./pages/DashboardAdmin";

// ======================================
// MÓDULOS DEL ESTUDIANTE
// ======================================

import Temas from "./pages/Temas";
import Lecciones from "./pages/Lecciones";
import Cuestionarios from "./pages/Cuestionario";
import Resultados from "./pages/Resultados";
import AsistenteIA from "./pages/AsistenteIA";
import RealidadAR from "./pages/RealidadAumentada";

// ======================================
// MÓDULOS DEL ADMINISTRADOR
// ======================================

import GestionAdmin from "./pages/GestionAdmin";

// ======================================
// RUTAS PRINCIPALES
// ======================================

function App() {

  return (
    <Routes>

      {/* ======================================
          PÁGINA INICIAL
      ====================================== */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* ======================================
          AUTENTICACIÓN
      ====================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/registro"
        element={<Registro />}
      />

      <Route
        path="/recuperar-clave"
        element={<RecuperarClave />}
      />

      <Route
        path="/restablecer-clave"
        element={<RestablecerClave />}
      />

      {/* ======================================
          ESTUDIANTE
      ====================================== */}

      <Route
        path="/estudiante"
        element={<MenuEstudiante />}
      >

        {/* DASHBOARD */}
        <Route
          index
          element={<DashboardEstudiante />}
        />

        {/* TEMAS */}
        <Route
          path="temas"
          element={<Temas />}
        />

        {/* LECCIONES GENERALES */}
        <Route
          path="lecciones"
          element={<Lecciones />}
        />

        {/* LECCIONES POR TEMA */}
        <Route
          path="lecciones/:id_tema"
          element={<Lecciones />}
        />

        {/* CUESTIONARIOS */}
        <Route
          path="cuestionarios"
          element={<Cuestionarios />}
        />

        {/* CUESTIONARIO DE UN TEMA */}
        <Route
          path="cuestionarios/:id_tema"
          element={<Cuestionarios />}
        />

        {/* RESULTADOS */}
        <Route
          path="resultados"
          element={<Resultados />}
        />

        {/* ASISTENTE IA */}
        <Route
          path="asistente-ia"
          element={<AsistenteIA />}
        />

        {/* EXPLICACIÓN DE UN INTENTO */}
        <Route
          path="asistente-ia/:id_intento"
          element={<AsistenteIA />}
        />

        {/* REALIDAD AUMENTADA */}
        <Route
          path="realidad-ar"
          element={<RealidadAR />}
        />

      </Route>

      {/* ======================================
          ADMINISTRADOR
      ====================================== */}

      <Route
        path="/admin"
        element={<MenuAdmin />}
      >

        {/* DASHBOARD ADMIN */}
        <Route
          index
          element={<DashboardAdmin />}
        />

        {/* GESTIÓN DE TEMAS */}
        <Route
          path="temas"
          element={<GestionAdmin modulo="temas" />}
        />

        {/* GESTIÓN DE LECCIONES */}
        <Route
          path="lecciones"
          element={<GestionAdmin modulo="lecciones" />}
        />

        {/* GESTIÓN DE PREGUNTAS */}
        <Route
          path="preguntas"
          element={<GestionAdmin modulo="preguntas" />}
        />

        {/* GESTIÓN DE MARCADORES AR */}
        <Route
          path="marcadores"
          element={<GestionAdmin modulo="marcadores" />}
        />

      </Route>

      {/* ======================================
          RUTAS NO ENCONTRADAS
      ====================================== */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;
