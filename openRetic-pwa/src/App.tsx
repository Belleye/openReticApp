import React from "react";
import AppRoutes from "./AppRoutes";
import { AppStateProvider } from "@/context/AppStateContext";

function App() {
  return (
    <AppStateProvider>
      <AppRoutes />
    </AppStateProvider>
  );
}

export default App;
