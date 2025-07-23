import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Configurazione del tema scuro dal localStorage o dalla preferenza del sistema
const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
  (localStorage.getItem('darkMode') === null && 
   window.matchMedia('(prefers-color-scheme: dark)').matches);

if (isDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Main app rendering
createRoot(document.getElementById("root")!).render(<App />);
