import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'https://pi3-backend-9lup.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> {
  const res: AxiosResponse<T> = await api.get(url, { params });
  return res.data;
}

async function post<T = unknown, D = unknown>(
  url: string,
  data?: D
): Promise<T> {
  const res: AxiosResponse<T> = await api.post(url, data);
  return res.data;
}

async function put<T = unknown, D = unknown>(
  url: string,
  data?: D
): Promise<T> {
  const res: AxiosResponse<T> = await api.put(url, data);
  return res.data;
}

async function del<T = unknown>(url: string): Promise<T> {
  const res: AxiosResponse<T> = await api.delete(url);
  return res.data;
}

export default {
  api,
  get,
  post,
  put,
  delete: del,
};

export { api };
