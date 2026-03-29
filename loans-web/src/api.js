const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getLoans = async () => {
  const response = await fetch(`${API_BASE_URL}/loans`);
  if (!response.ok) {
    throw new Error('Failed to fetch loans');
  }
  return response.json();
};

export const createLoan = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || 'Failed to create loan');
  }

  return response.json();
};
