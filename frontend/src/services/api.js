import axios from "axios";

// 🔥 Use different URLs based on environment
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://d36bbfu262j7b7.cloudfront.net/api'  // Your EC2 backend URL (production)
  : 'http://localhost:8000/api';      // Local backend (development)

const API = axios.create({
  baseURL: API_BASE_URL,
});

// attach token automatically
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;
