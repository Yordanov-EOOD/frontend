const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function addComment(tweetId, text) {
  return fetch(`${API}/tweets/${tweetId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  }).then(res => res.json());
}

export async function deleteComment(commentId) {
  return fetch(`${API}/comments/${commentId}`, { method: "DELETE" }).then(res => res.json());
}
