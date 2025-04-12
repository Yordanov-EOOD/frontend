// src/App.js
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";
import { ThemeContext } from "./context/ThemeContext";
import Router from "./Route";
import Auth from "./components/Auth/Auth";
import { AuthProvider, useAuth } from './context/AuthContext';
import { TweetProvider } from './context/TweetContext';
import { UserProvider } from './context/UserContext';

const AppContent = () => {
  const { theme } = React.useContext(ThemeContext);
  const { isAuthenticated } = useAuth();

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <ToastContainer
        toastClassName="toast-style"
        autoClose={2000}
        closeButton={false}
        draggable={false}
      />
      {isAuthenticated ? <Router /> : <Auth />}
    </StyledThemeProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <TweetProvider>
          <AppContent />
        </TweetProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;