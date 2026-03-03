import { createRoot } from "react-dom/client";
import { CurrencyProvider } from "./hooks/use-currency";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <App />
  </CurrencyProvider>
);
