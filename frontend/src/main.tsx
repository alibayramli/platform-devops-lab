import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App";
import "./styles.css";
import { ConfirmationDialogProvider } from "./shared/ui/confirmation-dialog";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfirmationDialogProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfirmationDialogProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
