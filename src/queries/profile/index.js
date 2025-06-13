const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function getProfile(handle) {
  return fetch(`${API}/profile/${handle}`).then(res => res.json());
}

export async function editProfile(data, authUserId) {
  if (!authUserId) {
    throw new Error('User authentication ID is required for profile update');
  }
  
  return fetch(`${API}/users/${authUserId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }).then(res => {
    if (!res.ok) {
      throw new Error(`Failed to update profile: ${res.status} ${res.statusText}`);
    }
    return res.json();
  });
}
