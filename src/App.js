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
import { AppProvider, useAppContext } from './context/AppContext';

const AppContent = () => {
  const { theme } = React.useContext(ThemeContext);
  const { isAuthenticated } = useAuth();
  const { state } = useAppContext();

  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <ToastContainer
        toastClassName="toast-style"
        autoClose={3000}
        closeButton={false}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />
      {!state.onlineStatus && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#f39c12',
          color: 'white',
          textAlign: 'center',
          padding: '8px',
          zIndex: 9999
        }}>
          You are currently offline. Some features may not work.
        </div>
      )}
      {isAuthenticated ? <Router /> : <Auth />}
    </StyledThemeProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <TweetProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </TweetProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;