const API = process.env.REST_API_ENDPOINT;

export async function getProfile(handle) {
  return fetch(`${API}/profile/${handle}`).then(res => res.json());
}

export async function editProfile(data) {
  return fetch(`${API}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
}
