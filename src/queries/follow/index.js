const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function follow(id) {
  return fetch(`${API}/users/${id}/follow`, { method: "POST" }).then(res => res.json());
}

export async function unfollow(id) {
  return fetch(`${API}/users/${id}/unfollow`, { method: "POST" }).then(res => res.json());
}
