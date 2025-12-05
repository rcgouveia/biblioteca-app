import axios from 'axios';
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/', // Use variável de ambiente para a URL do backend
});
export default api;