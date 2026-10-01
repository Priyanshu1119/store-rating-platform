import api from './api';

export const createRating = (storeId, rating) => api.post(`/stores/${storeId}/rating`, { rating });
export const updateRating = (storeId, rating) => api.put(`/stores/${storeId}/rating`, { rating });
