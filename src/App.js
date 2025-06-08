import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext, AuthProvider } from "./AuthContext";
import React, { useContext } from "react";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard/index";
import Team from "./scenes/team/index";
import Invoices from "./scenes/invoices/index";
import Contacts from "./scenes/contacts/index";
import Bar from "./scenes/bar/index";
import Form from "./scenes/form/index";
import Line from "./scenes/line/index";
import Pie from "./scenes/pie/index";
import FAQ from "./scenes/faq/index";
import Geography from "./scenes/geography/index";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/Login";

function AdminLayout({ setIsSidebar }) {
  return (
    <>
      <Sidebar isSidebar={true} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/geography" element={<Geography />} />
            </Routes>
          </main>
    </>
  );
}

// Exemple très simple UserLayout
function UserLayout({ setIsSidebar }) {
  return (
    <>
      <Sidebar isSidebar={true} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <h1>Interface utilisateur (simple)</h1>
        {/* ici tu mets les composants/pages de l’utilisateur */}
      </main>
    </>
  );
}

function AppContent() {
  const { auth } = useContext(AuthContext);
  const [isSidebar, setIsSidebar] = useState(true);

  if (!auth) {
    return <Routes><Route path="*" element={<Login />} /></Routes>;
  }

  if (auth.role === "admin") {
    return <AdminLayout setIsSidebar={setIsSidebar} />;
  }

  if (auth.role === "user") {
    return <UserLayout setIsSidebar={setIsSidebar} />;
  }

  return <div>Rôle inconnu</div>;
}

  function App() {
  const [theme, colorMode] = useMode();

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            <AppContent />
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;
