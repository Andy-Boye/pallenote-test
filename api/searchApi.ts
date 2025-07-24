import axios from "axios";

export const searchItems = async (query: string, filter: string = "") => {
  try {
    const response = await axios.get("https://your-api-url.com/search", {
      params: { q: query, filter },
    });
    return (response.data as any).results;
  } catch (error) {
    console.error("Search API error:", error);
    return [];
  }
};
