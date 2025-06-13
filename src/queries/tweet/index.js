const API = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080';

export async function newTweet(text, files, tags) {
  try {
    const response = await fetch(`${API}/yeets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        content: text,
        image: files && files.length > 0 ? files[0].url : null,
        tags: tags 
      }),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error creating yeet:", error);
    return { error: error.message };
  }
}

export async function deleteTweet(id) {
  try {
    const response = await fetch(`${API}/yeets/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error deleting yeet:", error);
    return { error: error.message };
  }
}

export async function toggleLike(id) {
  try {
    const response = await fetch(`${API}/yeets/${id}/like`, { method: "POST" });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: error.message };
  }
}

export async function toggleRetweet(id) {
  try {
    const response = await fetch(`${API}/yeets/${id}/retweet`, { method: "POST" });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error toggling retweet:", error);
    return { error: error.message };
  }
}

export async function getTweet(id) {
  try {
    const response = await fetch(`${API}/yeets/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching yeet ${id}:`, error);
    return { error: error.message };
  }
}

// New function to get paginated tweets
export async function getPaginatedTweets(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API}/yeets?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching paginated yeets:", error);
    return { error: error.message };
  }
}
