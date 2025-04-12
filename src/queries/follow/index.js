const API = process.env.REST_API_ENDPOINT;

export async function follow(id) {
  return fetch(`${API}/users/${id}/follow`, { method: "POST" }).then(res => res.json());
}

export async function unfollow(id) {
  return fetch(`${API}/users/${id}/unfollow`, { method: "POST" }).then(res => res.json());
}
