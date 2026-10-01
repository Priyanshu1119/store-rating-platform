import api, { cleanParams } from './api';

export const getStores = (params) => api.get('/stores', { params: cleanParams(params) });
export const getStore = (id) => api.get(`/stores/${id}`);
export const getOwnerDashboard = (params) => api.get('/owner/dashboard', { params: cleanParams(params) });
