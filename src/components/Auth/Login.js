// src/components/Auth/Login.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { useAuth } from "../../context/AuthContext";

export default ({ changeToSignup }) => {
  const email = useInput("");
  const password = useInput("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.value || !password.value) {
      return toast.error("You need to fill all the fields");
    }

    setLoading(true);
    try {
      const credentials = {
        email: email.value,
        password: password.value
      };
      console.log("Login data being sent:", JSON.stringify(credentials));
      await login(credentials);
      toast.success(`You are logged in`);
      // Don't need to reset values as the page will redirect
    } catch (err) {
      console.error("Login error details:", err);
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form center onSubmit={handleLogin}>
      <Input
        text="Email"
        type="email"
        value={email.value}
        onChange={email.onChange}
      />
      <Input
        text="Password"
        type="password"
        value={password.value}
        onChange={password.onChange}
      />

      <Button xl outline disabled={loading} type="submit">
        {loading ? "Logging in" : "Login"}
      </Button>
      <span>or</span>
      <Button xl type="button" onClick={changeToSignup}>
        Signup
      </Button>
    </Form>
  );
};