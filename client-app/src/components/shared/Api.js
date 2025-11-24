const API_BASE = "http://localhost:5077";

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}/api/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

const Api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API responded with status ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("API Error Details:", errorData);
          if (errorData.error) {
            errorMessage += `: ${errorData.error}`;
          }
        } catch (e) {
          // Response wasn't JSON, use default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  }
};

export default Api;
