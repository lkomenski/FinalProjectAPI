const API_BASE = "http://localhost:5077/api";

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`http://localhost:5077/api/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

