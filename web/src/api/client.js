import axios from 'axios';
import { message } from 'antd';

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Request failed';
    message.error(msg);
    return Promise.reject(error);
  }
);

export function setAuthHeaders(projectId, apiKey) {
  client.defaults.headers['X-Project-Id'] = projectId || '';
  client.defaults.headers['X-API-Key'] = apiKey || '';
}

export default client;
