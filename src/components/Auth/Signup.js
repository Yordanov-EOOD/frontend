// src/components/Auth/Signup.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { useAuth } from "../../context/AuthContext";

export default ({ changeToLogin }) => {
  const handle = useInput("");
  const email = useInput("");
  const password = useInput("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !handle.value ||
      !email.value ||
      !password.value
    ) {
      return toast.error("You need to fill in all the fields");
    }

    if (
      handle.value === "/" ||
      handle.value === "explore" ||
      handle.value === "settings/profile" ||
      handle.value === "notifications" ||
      handle.value === "bookmarks"
    ) {
      return toast.error("Your handle is not valid, try a different one");
    }

    const re = /^[a-z0-9]+$/i;

    if (re.exec(handle.value) === null) {
      return toast.error(
        "Your handle contains some non-alphanumeric characters, choose a better handle name"
      );
    }

    const userData = {
      username: handle.value,
      email: email.value,
      password: password.value
    };
    
    console.log("Registration data being sent:", JSON.stringify(userData));
    
    setLoading(true);
    try {
      await register(userData);
      toast.success("You are logged in");
      // Don't reset fields as page will redirect
    } catch (err) {
      console.error("Registration error details:", err);
      const errorMessage = err.response?.data?.error || "Registration failed";
      console.log("Server error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form center onSubmit={handleSignup}>
      <Input text="Handle" value={handle.value} onChange={handle.onChange} />
      <div className="group-input">
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
      </div>
      <Button xl outline disabled={loading} type="submit">
        {loading ? "Signing up" : "Sign up"}
      </Button>
      <span>or</span>
      <Button xl type="button" onClick={changeToLogin}>
        Login
      </Button>
    </Form>
  );
};