import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages publiques
import { PublicView } from "./pages/PublicView";
import { Login } from "./pages/Login";
import { CalendarPage } from "./pages/Calendar";
import { AppointmentPage } from "./pages/Appointments";
import { TriGuidePage } from "./pages/TriGuidePage";
import { About } from "./pages/About";

// Dashboard (protégé)
import { WasteDashboard } from "./pages/WasteDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil publique */}
        <Route path="/" element={<PublicView />} />

        {/* Pages publiques accessibles à tous */}
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/encombrants" element={<AppointmentPage />} />
        <Route path="/guide-tri" element={<TriGuidePage />} />
        <Route path="/about" element={<About />} />

        {/* Connexion */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard complet (toutes les vues admin/superviseur/technicien/citoyen) */}
        <Route path="/app/*" element={<WasteDashboard />} />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;