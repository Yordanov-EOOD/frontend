import React from "react";
import { render } from "react-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

const RootApp = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ErrorBoundary>
);

render(<RootApp />, document.getElementById("root"));
