'use client';

import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${baseUrl.replace(/\/$/, '')}/api`,
  withCredentials: true,
});

export default api;
