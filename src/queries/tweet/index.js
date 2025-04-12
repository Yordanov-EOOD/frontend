const API = process.env.REST_API_ENDPOINT;

export async function newTweet(text, files, tags) {
  return fetch(`${API}/tweets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, files, tags }),
  }).then(res => res.json());
}

export async function deleteTweet(id) {
  return fetch(`${API}/tweets/${id}`, { method: "DELETE" }).then(res => res.json());
}

export async function toggleLike(id) {
  return fetch(`${API}/tweets/${id}/like`, { method: "POST" }).then(res => res.json());
}

export async function toggleRetweet(id) {
  return fetch(`${API}/tweets/${id}/retweet`, { method: "POST" }).then(res => res.json());
}

export async function getTweet(id) {
  return fetch(`${API}/tweets/${id}`).then(res => res.json());
}
