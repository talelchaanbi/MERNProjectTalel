import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.msg) {
      error.message = error.response.data.msg;
    }
    return Promise.reject(error);
  }
);

export default client;
