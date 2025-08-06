import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPasswordPage from "./pages/AuthPages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/AuthPages/ResetPasswordPage";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import UsersPage from "./pages/UsersPage";
import AmbienteDeFormacion from "./pages/AmbientePges/AmbienteDeFormacion";
import CargaMasivaPage from "./pages/CargaMasiva/CargaMasivaPage";
import ProgramsPage from "./pages/Programs/ProgramsPage";
import GrupoPage from "./pages/GrupoPages/GrupoPage";
import GruposInstructorPage from "./pages/GruposInstructor/GruposInstructorPage";
import Aprendices from "./pages/Dashboard/Aprendices";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas Protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<Home />} />
            <Route path="/dashboard-aprendices" element={<Aprendices />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/programacion-instructor" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route
              path="/ambiente-de-formacion"
              element={<AmbienteDeFormacion />}
            />
            <Route path="/carga-masiva" element={<CargaMasivaPage />} />
            <Route 
              path="/programas-formacion" 
              element={
                <RoleProtectedRoute allowedRoleIds={[1, 2]}>
                  <ProgramsPage />
                </RoleProtectedRoute>
              } 
            />
            <Route path="/grupos" element={<GrupoPage />} />
            <Route 
              path="/grupos-instructor" 
              element={
                <RoleProtectedRoute allowedRoleIds={[3]}>
                  <GruposInstructorPage />
                </RoleProtectedRoute>
              } 
            />

            {/* User Profiles */}

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
