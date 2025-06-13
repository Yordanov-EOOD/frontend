const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function getFeed() {
  try {
    const response = await fetch(`${API}/feed`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching feed:", error);
    return { error: error.message };
  }
}

export async function getPaginatedFeed(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API}/feed?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching paginated feed:", error);
    return { error: error.message };
  }
}

export async function getUsers() {
  try {
    const response = await fetch(`${API}/users`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: error.message };
  }
}
