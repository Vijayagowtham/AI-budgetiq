const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('budgetiq_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleUnauthorized = () => {
  localStorage.removeItem('budgetiq_token');
  localStorage.removeItem('budgetiq_user');
  window.dispatchEvent(new Event('auth-unauthorized'));
};

const parseResponse = async (res) => {
  let data;
  const contentType = res.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      // Non-JSON response (HTML error page, plain text, etc.)
      const text = await res.text();
      if (!res.ok) {
        if (res.status === 401) handleUnauthorized();
        throw new Error(`Server error (${res.status}). Please ensure the backend is running.`);
      }
      return text;
    }
  } catch (parseErr) {
    if (parseErr.message.includes('Server error') || parseErr.message.includes('Unauthorized')) throw parseErr;
    throw new Error('Unable to connect to server. Please check your connection and try again.');
  }
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  get: async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers }
    });
    return parseResponse(res);
  },

  post: async (endpoint, payload, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: { ...getHeaders(), ...options.headers },
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  put: async (endpoint, payload, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: { ...getHeaders(), ...options.headers },
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  delete: async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: { ...getHeaders(), ...options.headers }
    });
    return parseResponse(res);
  }
};
