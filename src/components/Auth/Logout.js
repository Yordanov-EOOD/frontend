// src/components/Auth/Logout.js
import React, { useContext } from "react";
import { toast } from "react-toastify";
import { UserIcon } from "../Icons";
import { ThemeContext } from "../../context/ThemeContext";
import { Wrapper } from "../ToggleTheme";
import { useAuth } from "../../context/AuthContext";

const Logout = () => {
  const { theme } = useContext(ThemeContext);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You are logged out");
      // The page will reload or redirect due to our route protection
    } catch (err) {
      toast.error(err.response?.data?.error || "Logout failed");
    }
  };

  return (
    <Wrapper onClick={handleLogout}>
      <UserIcon sm color={theme.accentColor} />
      <p>Logout</p>
    </Wrapper>
  );
};

export default Logout;