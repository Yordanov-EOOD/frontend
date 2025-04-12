const API = process.env.REST_API_ENDPOINT;

export async function userLoggedIn() {
  return fetch(`${API}/auth/status`).then(res => res.json());
}

export async function getUser() {
  return fetch(`${API}/auth/user`).then(res => res.json());
}
