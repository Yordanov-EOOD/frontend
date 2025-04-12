import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./styles/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/layout/Nav";
import Home from "./pages/Home";
import MasterTweet from "./components/Tweet/MasterTweet";
import Profile from "./components/Profile/Profile";
import Bookmarks from "./pages/Bookmarks";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Suggestion from "./pages/Suggestion";
import EditProfile from "./components/Profile/EditProfile";
import Auth from "./components/Auth/Auth";

const AppRouter = () => {
  return (
    <Router>
      <Nav />
      <Layout>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/:handle/status/:tweetId" element={<ProtectedRoute><MasterTweet /></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/:handle" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Suggestion />
      </Layout>
    </Router>
  );
};

export default AppRouter;
