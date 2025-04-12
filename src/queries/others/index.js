const API = process.env.REST_API_ENDPOINT;

export async function getFeed() {
  return fetch(`${API}/feed`).then(res => res.json());
}

export async function getUsers() {
  return fetch(`${API}/users`).then(res => res.json());
}
