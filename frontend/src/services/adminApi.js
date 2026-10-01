import api, { cleanParams } from './api';

export const getDashboard = () => api.get('/admin/dashboard');
export const getUsers = (params) => api.get('/admin/users', { params: cleanParams(params) });
export const getUser = (id) => api.get(`/admin/users/${id}`);
export const createUser = (data) => api.post('/admin/users', data);
export const getAdminStores = (params) => api.get('/admin/stores', { params: cleanParams(params) });
export const createStore = (data) => api.post('/admin/stores', data);
export const getAvailableOwners = () => api.get('/admin/owners');
