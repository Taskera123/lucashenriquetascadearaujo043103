import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

export const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000
});
