const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getResourceItems = async (resource) => {
  const response = await fetch(`${API_BASE_URL}/${resource}`);
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || `Failed to fetch ${resource}`);
  }

  return response.json();
};

export const createResourceItem = async (resource, payload) => {
  const response = await fetch(`${API_BASE_URL}/${resource}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || `Failed to create ${resource}`);
  }

  return response.json();
};
