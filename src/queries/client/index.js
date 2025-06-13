const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function userLoggedIn() {
  return fetch(`${API}/auth/status`).then(res => res.json());
}

export async function getUser() {
  return fetch(`${API}/auth/user`).then(res => res.json());
}
