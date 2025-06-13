const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function searchByUser(term) {
  return fetch(`${API}/search/user?term=${encodeURIComponent(term)}`)
    .then(res => res.json());
}

export async function searchByTag(term) {
  return fetch(`${API}/search/tag?term=${encodeURIComponent(term)}`)
    .then(res => res.json());
}

export async function searchByTweet(term) {
  return fetch(`${API}/search/tweet?term=${encodeURIComponent(term)}`)
    .then(res => res.json());
}
