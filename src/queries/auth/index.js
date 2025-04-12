import apiClient from '../../utils/apiClient';

export async function login(email, password) {
  console.log("Attempting login");
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error("Login request failed:", error);
    throw error;
  }
}

export async function signup(username, email, password) {
  console.log("Attempting signup");
  try {
    const response = await apiClient.post('/register', { username, email, password });
    return response.data;
  } catch (error) {
    console.error("Signup request failed:", error);
    throw error;
  }
}
