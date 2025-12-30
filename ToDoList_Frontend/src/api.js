import axios from "axios";

// Access environment variables based on the build tool used (Vite vs CRA)
const API_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "https://tasktracker-backend-l131.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests if needed
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
