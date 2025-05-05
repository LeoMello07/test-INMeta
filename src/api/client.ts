import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://fieldsync.onrender.com/',
  headers: { 'Content-Type': 'application/json' },
});